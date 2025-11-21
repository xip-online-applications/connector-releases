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

build-dep: _cleanup_build_dep
	$(MAKE) _prepare_build_dep
	$(MAKE) _prepare_versioning_dep
	$(MAKE) _run_build_dep
	$(MAKE) _cleanup_build_dep

_prepare_build_dep:
	mkdir -p ".transai-connector-orchestrator" || true
	cp -Rp -t ".transai-connector-orchestrator/" dep/*
	cp -Rp -t ".transai-connector-orchestrator/usr/local/share/transai/connector-orchestrator/" .nvmrc apps libs main.js package*.json node_modules

_prepare_versioning_dep:
	sed -i "s/:version:/$(shell cat package.json | jq -r '.version')-$(shell date +%s)/g" .transai-connector-orchestrator/DEBIAN/control

_run_build_dep:
	dpkg-deb --build ".transai-connector-orchestrator"
	mv ".transai-connector-orchestrator.deb" "./dist/transai-connector-orchestrator-$(shell dpkg --print-architecture).deb"

_cleanup_build_dep:
	rm -rf ".transai-connector-orchestrator"
