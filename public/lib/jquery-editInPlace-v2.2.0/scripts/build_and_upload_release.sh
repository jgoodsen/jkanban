#!/bin/sh

USAGE="Usage: $0 <bzr-tag-to-release> <googlecode-username> <googlecode-password>"

RELEASE_TAG=${1:? $USAGE}
USERNAME=${2:? $USAGE}
PASSWORD=${3:? $USAGE}

cd "$(dirname "$0")/.."

echo "Updating changelog"
bzr log --log-format=gnu-changelog > CHANGELOG
bzr commit CHANGELOG -m "updated changelog before release"

echo "Tagging release"
bzr tag "$RELEASE_TAG"

echo "Pushing all changes to upstream (googlecode)"
bzr push bm:upstream

echo "Building release zip"
mkdir -p build
EXPORTED_FILE="build/jquery-editInPlace-v${RELEASE_TAG}.zip"
bzr export --revision="$RELEASE_TAG" "$EXPORTED_FILE"

echo "Uploading release zip"
SUMMARY="jQuery In Place Editor v${RELEASE_TAG}"
python scripts/googlecode_upload.py \
	--summary="$SUMMARY" \
	--project="jquery-in-place-editor" \
	--user="$USERNAME" \
	--password="$PASSWORD" \
	--labels="Type-Archive,OpSys-All" \
	"$EXPORTED_FILE"

echo
echo
echo "Now you can feature this download at http://code.google.com/p/jquery-in-place-editor/downloads/list"
echo
echo