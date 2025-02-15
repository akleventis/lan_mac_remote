# get script's directory
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd "$SCRIPTPATH"

# build go_binary executable
echo "Building Go server..."
go build -o ../go_binary ../server/api.go ../server/handlers.go ../server/utils.go ../server/nsevent.go

echo
echo '...success'