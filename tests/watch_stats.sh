watch -n 2 '
echo "====== NODE LOAD ======" &&
uptime &&
echo &&
echo "====== MEMORY ======" &&
free -h &&
echo &&
echo "====== DOCKER STATS ======" &&
docker stats --no-stream
'
