install:
	git reset --hard
	git pull
	npm install --legacy-peer-deps
	$(MAKE) start

start:
	systemctl restart transai.service

stop:
	systemctl stop transai.service

status:
	systemctl status transai.service

logs:
	tail -f /var/log/transai*

logsj:
	journalctl -u  transai.service -f -n 100

cleanup:
	rm -rf apps libs main.js* package*
