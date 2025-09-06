const crypto = require('node:crypto');

const usernameRegex = /^[a-zA-Z0-9_.-]{5,30}$/;

const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

const pwdRegex = /^.{8,}$/;

const reservedUsernames = [
	'admin', 'root', 'support', 'system', 'null', 'undefined',
	'moderator', 'mod', 'administrator', 'webmaster', 'contact',
	'help', 'about', 'info', 'owner', 'superuser', 'staff', 'api',
	'account', 'user', 'users', 'me', 'you', 'settings', 'config',
	'dashboard', 'login', 'logout', 'register', 'signup', 'signin',
	'signout', 'profile', 'home', 'security', 'terms', 'privacy',
	'tos', 'faq', 'feedback', 'reports', 'report', 'adminpanel',
	'console', 'auth', 'v1', 'v2', 'internal', 'public', 'private',
	'guest', 'anonymous', 'developer', 'dev', 'ops', 'beta', 'test',
	'testing', 'demo', 'rootadmin', 'superadmin', 'sysadmin',
	'master', 'operator', 'staffer', 'moderat0r', 'founder', 'ceo',
	'cto', 'cfo', 'coo', 'hr', 'securityteam', 'supportteam',
	'billing', 'payments', 'invoice', 'shop', 'store', 'cart',
	'checkout', 'subscribe', 'unsubscribe', 'apiadmin', 'apikey',
	'service', 'systemadmin', 'nulluser', 'undefineduser',
	'supervisor', 'manager', 'leader', 'team', 'project', 'partner',
	'affiliate', 'marketing', 'sales', 'contactus', 'post', 'posts',
	'article', 'articles', 'news', 'blog', 'blogs', 'events',
	'calendar', 'schedule', 'status', 'error', 'errors', 'bug',
	'bugs', 'patch', 'update', 'upgrade', 'downgrade', 'version',
	'release', 'devops', 'analytics', 'stats', 'statistics',
	'metrics', 'metricsadmin', 'adminstats', 'supportdesk',
	'helpline', 'helpdesk', 'moderation', 'moderate', 'superuser',
	'usersupport', 'client', 'clients', 'customer', 'customers',
	'apiuser', 'systemuser', 'bot', 'bots', 'crawler', 'spider',
	'seo', 'spam', 'phishing', 'blacklist', 'whitelist', 'admin123',
	'testuser', 'demoaccount', 'trial', 'betauser', 'alpha',
	'alphatest', 'sandbox', 'sandboxuser', 'readonly', 'readwrite',
	'writeonly', 'masterkey', 'access', 'permission', 'permissions',
	'role', 'roles', 'group', 'groups', 'cron', 'daemon', 'task',
	'jobs', 'worker', 'queue', 'scheduler', 'cache', 'temp', 'tmp',
	'backup', 'restore', 'http', 'https', 'ftp', 'ssh', 'smtp',
	'pop3', 'imap', 'dns', 'tcp', 'udp', 'ip', 'json', 'xml', 'csv',
	'html', 'css', 'js', 'javascript', 'node', 'npm', 'yarn', 'fatal',
	'panic', 'crash', 'fail', 'failure', 'exception', 'bugreport',
	'trace', 'stack', 'overflow', 'memory', 'analyst', 'consultant',
	'engineer', 'designer', 'architect', 'tester', 'qa', 'qaengineer',
	'nullify', 'void', 'undefinedvariable', 'delete', 'remove',
	'drop', 'truncate', 'rootuser', 'super', 'god', 'admin1', 'julia',
	'administrator1', 'sys', 'html', 'css', 'jspython', 'javascript',
	'cc++', 'java', 'c#', 'rust', 'go', 'verilog', 'sql', 'mongodb',
	'swift', 'ruby', 'typescript', 'dart', 'kotlin', 'perl', 'scala'
];

function getRandomSuffix(length = 4) {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_.';
	let result = '';
	const bytes = crypto.randomBytes(length);

	for (let i = 0; i < length; i++) {
		result += chars[bytes[i] % chars.length];
	}

	return result;
}

function sanitizeUsername(name) {
	let username = name.trim();
	username = username.replace(/[\s-]+/g, "_");
	username = username.replace(/[^a-zA-Z0-9._]/g, "");

	if (!/^[a-zA-Z]/.test(username)) {
		username = "user_" + username;
	}

	username = username.replace(/^[._]+|[._]+$/g, "");
	username = username.slice(0, 12);

	if (!usernameRegex.test(username) || reservedUsernames.includes(username)) {
		const randomSuffix = getRandomSuffix();
		username = `user_${randomSuffix}`;
	}

	return username;
}

module.exports = {
	usernameRegex,
	emailRegex,
	pwdRegex,
	reservedUsernames,
	sanitizeUsername
};