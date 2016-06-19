install:
	@if [ ! -f "$$(which cooking)" ]; then npm --registry=http://registry.npm.taobao.org install cooking -g; fi
	@if [ ! -f "$$(which nodemon)" ]; then npm --registry=http://registry.npm.taobao.org install nodemon -g; fi
	@npm --registry=http://registry.npm.taobao.org install

dev: install
	@cooking watch

server: install
	@nodemon server/entry.js

deploy: install
	@cooking build
