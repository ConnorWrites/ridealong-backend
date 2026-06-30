#!/bin/bash
# Quick end-to-end test of every RideAlong endpoint.
# Run with: bash test-api.sh
# Requires: curl, jq (brew install jq if you don't have it)

BASE="http://localhost:3000"

echo "=== Health check ==="
curl -s "$BASE/health"
echo -e "\n"

echo "=== Signup: driver ==="
DRIVER_RES=$(curl -s -X POST "$BASE/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"driver1@test.com","password":"secret123","name":"Dana Driver","role":"DRIVER"}')
echo "$DRIVER_RES" | jq
DRIVER_TOKEN=$(echo "$DRIVER_RES" | jq -r '.token')
DRIVER_ID=$(echo "$DRIVER_RES" | jq -r '.user.id')
echo -e "\n"

echo "=== Signup: passenger ==="
PASSENGER_RES=$(curl -s -X POST "$BASE/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"passenger1@test.com","password":"secret123","name":"Pat Passenger","role":"PASSENGER"}')
echo "$PASSENGER_RES" | jq
PASSENGER_TOKEN=$(echo "$PASSENGER_RES" | jq -r '.token')
echo -e "\n"

echo "=== Login: driver (sanity check) ==="
curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"driver1@test.com","password":"secret123"}' | jq
echo -e "\n"

echo "=== Login with wrong password (should fail with 401) ==="
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"driver1@test.com","password":"wrongpassword"}'
echo -e "\n"

echo "=== Create ride (as driver) ==="
DEPARTURE=$(date -u -v+1H +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d "+1 hour" +"%Y-%m-%dT%H:%M:%S.000Z")
RIDE_RES=$(curl -s -X POST "$BASE/rides" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  -d "{\"origin\":\"Campus\",\"destination\":\"Downtown\",\"departureTime\":\"$DEPARTURE\"}")
echo "$RIDE_RES" | jq
RIDE_ID=$(echo "$RIDE_RES" | jq -r '.id')
echo -e "\n"

echo "=== Try creating a ride as passenger (should fail with 403) ==="
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "$BASE/rides" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PASSENGER_TOKEN" \
  -d "{\"origin\":\"Campus\",\"destination\":\"Downtown\",\"departureTime\":\"$DEPARTURE\"}"
echo -e "\n"

echo "=== List all upcoming rides (as passenger) ==="
curl -s "$BASE/rides" \
  -H "Authorization: Bearer $PASSENGER_TOKEN" | jq
echo -e "\n"

echo "=== List rides filtered by origin ==="
curl -s "$BASE/rides?origin=Campus" \
  -H "Authorization: Bearer $PASSENGER_TOKEN" | jq
echo -e "\n"

echo "=== Get ride by id ==="
curl -s "$BASE/rides/$RIDE_ID" \
  -H "Authorization: Bearer $PASSENGER_TOKEN" | jq
echo -e "\n"

echo "=== List driver's own rides ==="
curl -s "$BASE/rides/mine" \
  -H "Authorization: Bearer $DRIVER_TOKEN" | jq
echo -e "\n"

echo "=== Passenger requests the ride ==="
REQUEST_RES=$(curl -s -X POST "$BASE/rides/$RIDE_ID/request" \
  -H "Authorization: Bearer $PASSENGER_TOKEN")
echo "$REQUEST_RES" | jq
REQUEST_ID=$(echo "$REQUEST_RES" | jq -r '.id')
echo -e "\n"

echo "=== Driver tries to request own ride (should fail) ==="
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "$BASE/rides/$RIDE_ID/request" \
  -H "Authorization: Bearer $DRIVER_TOKEN"
echo -e "\n"

echo "=== Passenger requests same ride again (should fail, already requested) ==="
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "$BASE/rides/$RIDE_ID/request" \
  -H "Authorization: Bearer $PASSENGER_TOKEN"
echo -e "\n"

echo "=== Driver accepts the request ==="
curl -s -X POST "$BASE/rides/requests/$REQUEST_ID/accept" \
  -H "Authorization: Bearer $DRIVER_TOKEN" | jq
echo -e "\n"

echo "=== Driver tries to accept again (should fail, already handled) ==="
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "$BASE/rides/requests/$REQUEST_ID/accept" \
  -H "Authorization: Bearer $DRIVER_TOKEN"
echo -e "\n"

echo "=== No auth header at all (should fail with 401) ==="
curl -s -w "\nHTTP Status: %{http_code}\n" "$BASE/rides"
echo -e "\n"

echo "=== Done ==="

