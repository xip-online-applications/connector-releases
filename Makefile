install:
	git fetch && git pull
	npm ci
	systemctl restart transai.service

status:
	systemctl status transai.service

logs:
	tail -f /var/log/transai*

cleanup:
	rm -rf apps libs main.js package*
