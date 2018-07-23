node="/usr/local/bin/node"
findChrome=`ps -ef | grep "chrome" | awk '{print $2}'`
echo "first start"
while(true)
do
	echo "start"
	echo $findChrome
	for id in $findChrome
	do
		kill -9 $id
		echo "$id killed"
	done
	echo "close chrome already and then sleep 5 seconds"
	sleep 5s
	/usr/bin/google-chrome &
	echo "start chrome already and then sleep 10 minutes"
	sleep 30m
done
echo "final end"




