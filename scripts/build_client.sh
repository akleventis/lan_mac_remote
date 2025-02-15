# get script's directory
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd "$SCRIPTPATH"

# export frontend
echo "Buildling Next.js frontend..."
cd ../client
npm install
npm run build

echo
echo '...success'