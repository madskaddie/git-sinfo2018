#!/usr/bin/env bash
#
#

set -euo pipefail

ROOT=$(readlink -f `dirname ${BASH_SOURCE[0]}`/..)


function usage () {
  echo "usage not implemented" >&2
}


while getopts ":h" opt; do
  case "$opt" in
    h)
      usage
      exit 0
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      usage
      exit 1
      ;;
    :)
      echo "flag -$OPTARG requires arguments" >&2
      usage
      exit 1
      ;;
    *)
      echo "assert error" >&2
      exit 1
      ;;
    esac
done
shift $((OPTIND-1))



cat > "$ROOT/public/js/conf.js" <<EOF

const CONF = { token: '$TOKEN'}

EOF

# vi: set ts=2 sw=2 : 
# EOF
