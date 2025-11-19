install:
	git reset --hard
	git pull
	npm install
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

build-dep:
	mkdir -p ".transai-connector-orchestrator" || true
	cp -Rp -t ".transai-connector-orchestrator/" dep/*
	cp -Rp -t ".transai-connector-orchestrator/usr/local/share/transai/connector-orchestrator/" apps libs main.js package*.json
	dpkg-deb --build ".transai-connector-orchestrator"
	mv ".transai-connector-orchestrator.deb" ./
	rm -rf ".transai-connector-orchestrator*"
