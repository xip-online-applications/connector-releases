install:
	git fetch && git pull
	npm ci
	$(MAKE) start

start:
	systemctl restart transai.service

stop:
	systemctl stop transai.service

status:
	systemctl status transai.service

logs:
	tail -f /var/log/transai*

cleanup:
	rm -rf apps libs main.js package*
