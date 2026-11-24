#!/usr/bin/env bash
set -Eeuo pipefail

archive=${1:-}
revision=${2:-}
expected=${3:-}
archive_sha=${4:-}
base=/var/www/helvnet
release="$base/releases/$revision"
site=/etc/nginx/sites-available/helvnet
redirects=/etc/nginx/snippets/helvnet-redirects.conf

fail() {
  printf '%s\n' "$*" >&2
  exit 1
}

[[ "$(hostname -s)" == keywest && "$EUID" == 0 ]] ||
  fail 'Exécutez cette commande avec sudo sur Keywest.'
[[ -f "$archive" && "$revision" =~ ^[a-f0-9]{40}$ && "$expected" =~ ^[a-f0-9]{40}$ && "$archive_sha" =~ ^[a-f0-9]{64}$ ]] ||
  fail 'Usage : activate.sh ARCHIVE RÉVISION RÉVISION_ACTIVE SHA256_ARCHIVE'
[[ "$(readlink -f /etc/nginx/sites-enabled/helvnet)" == "$site" ]] ||
  fail 'Hôte Helvnet introuvable.'

exec 9>/run/lock/helvnet-activate.lock
flock -n 9 || fail 'Une publication Helvnet est déjà en cours.'
live_root=$(awk '$1 == "root" && $2 ~ /^\/var\/www\/helvnet\/releases\// { sub(/;$/, "", $2); print $2 }' "$site")
[[ "$live_root" == "$base/releases/$expected" || "$live_root" == "$release" ]] ||
  fail 'La version active a changé depuis la préparation.'

work=$(mktemp -d "$base/.helvnet-XXXXXXXX")
backup=
changed=0
install_config() {
  install -m 644 -- "$1" "$2.next"
  mv -Tf -- "$2.next" "$2"
}

finish() {
  local status=$?
  trap - EXIT
  if (( status && changed )); then
    if install_config "$backup/helvnet.conf" "$site" &&
      install_config "$backup/helvnet-redirects.conf" "$redirects" &&
      nginx -t && systemctl reload nginx; then
      printf '%s\n' 'Version précédente rétablie.' >&2
    else
      printf 'Rétablissement à vérifier. Sauvegarde %s\n' "$backup" >&2
    fi
  fi
  rm -f -- "$site.next" "$redirects.next"
  [[ "$work" == "$base/.helvnet-"* ]] && rm -rf -- "$work"
  exit "$status"
}
trap finish EXIT

install -m 600 -- "$archive" "$work/release.tar.gz"
printf '%s  %s\n' "$archive_sha" "$work/release.tar.gz" | sha256sum --check --status --strict ||
  fail 'Le SHA256 de l’archive ne correspond pas.'
tar --extract --gzip --file "$work/release.tar.gz" --directory "$work" --no-same-owner --no-same-permissions
for file in index.html 404.html developpement-web/index.html applications-sur-mesure/index.html automatisation-ia/index.html contact/index.html sitemap.xml robots.txt; do
  [[ -s "$work/dist/$file" ]] || fail "Fichier manquant dans la livraison : $file"
done
grep -Fq "root $release;" "$work/helvnet.conf" || fail 'La racine Nginx ne correspond pas à la révision.'
[[ -s "$work/helvnet-redirects.conf" ]] || fail 'Fichier de redirections manquant.'

if [[ -d "$release" ]]; then
  diff -qr -- "$work/dist" "$release" || fail 'Cette révision existe déjà avec d’autres fichiers.'
else
  find "$work/dist" -type d -exec chmod 755 {} +
  find "$work/dist" -type f -exec chmod 644 {} +
  mv -T -- "$work/dist" "$release"
fi

if ! cmp -s "$work/helvnet.conf" "$site" || ! cmp -s "$work/helvnet-redirects.conf" "$redirects"; then
  backup=$(mktemp -d "$base/.rollback-helvnet-XXXXXXXX")
  cp -p -- "$site" "$backup/helvnet.conf"
  cp -p -- "$redirects" "$backup/helvnet-redirects.conf"
  changed=1
  install_config "$work/helvnet-redirects.conf" "$redirects"
  install_config "$work/helvnet.conf" "$site"
  nginx -t
  systemctl reload nginx
fi

curl_options=(--silent --show-error --max-time 6 --noproxy '*' --resolve helvnet.ch:443:127.0.0.1)
for attempt in {1..6}; do
  if curl "${curl_options[@]}" --fail -o "$work/home-check" https://helvnet.ch/ &&
    cmp -s "$release/index.html" "$work/home-check"; then break; fi
  sleep 1
done
cmp -s "$release/index.html" "$work/home-check" || fail 'Le nouvel accueil ne répond pas sur HTTPS.'

for path in /developpement-web/ /applications-sur-mesure/ /automatisation-ia/ '/contact/?axe=ia' /robots.txt /sitemap.xml; do
  [[ "$(curl "${curl_options[@]}" -o /dev/null -w '%{http_code}' "https://helvnet.ch$path")" == 200 ]] ||
    fail "Réponse inattendue pour $path"
done
services_redirect=$(curl "${curl_options[@]}" -o /dev/null -w '%{http_code} %{redirect_url}' 'https://helvnet.ch/services?source=controle')
[[ "$services_redirect" == '301 https://helvnet.ch/developpement-web/?source=controle' ]] ||
  fail 'Redirection /services inattendue.'
for path in /realisations/cafe-brunch/boissons /realisations/nh-installation/ /realisations/kebab-paradise/ /projets/nh-installation/ /projets/kebab-paradise/ /verification-seo-page-inconnue-2026/; do
  [[ "$(curl "${curl_options[@]}" -o /dev/null -w '%{http_code}' "https://helvnet.ch$path")" == 404 ]] ||
    fail "Réponse inattendue pour $path"
done

if [[ -n "$backup" ]]; then printf 'Sauvegarde Nginx %s\n' "$backup"; fi
printf 'Helvnet actif sur Keywest · %s\n' "$revision"
