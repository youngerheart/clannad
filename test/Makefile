# 1. project test
project-add:
	@mocha project-add.js

project-deal:
	@mocha project-deal.js

project: project-add project-deal

# 2. table test
table-add: project-add
	@mocha table-add.js

table-deal:
	@mocha table-deal.js

table: table-add table-deal project-deal

# 3. field test
field-add: table-add
	@mocha field-add.js

field-deal:
	@mocha field-deal.js

field: field-add field-deal table-deal project-deal

# 4. source test
source-add:
	@mocha source-add.js

source-deal:
	@mocha source-deal.js
