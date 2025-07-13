const updateLanguageCount = (user, countType, language) => {
	switch (language) {
		case 'python':
			user[countType].set('py', (user[countType].get('py') || 0) + 1);
			break;
		case 'javascript':
			user[countType].set('js', (user[countType].get('js') || 0) + 1);
			break;
		case 'HtmlJsCss':
			user[countType].set(
				'HtmlJsCss',
				(user[countType].get('HtmlJsCss') || 0) + 1
			);
			break;
		case 'c':
			user[countType].set('c', (user[countType].get('c') || 0) + 1);
			break;
		case 'cpp':
			user[countType].set('cpp', (user[countType].get('cpp') || 0) + 1);
			break;
		case 'java':
			user[countType].set('java', (user[countType].get('java') || 0) + 1);
			break;
		case 'csharp':
			user[countType].set('cs', (user[countType].get('cs') || 0) + 1);
			break;
		case 'rust':
			user[countType].set('rust', (user[countType].get('rust') || 0) + 1);
			break;
		case 'go':
			user[countType].set('go', (user[countType].get('go') || 0) + 1);
			break;
		case 'verilog':
			user[countType].set('verilog', (user[countType].get('verilog') || 0) + 1);
			break;
		case 'sql':
			user[countType].set('sql', (user[countType].get('sql') || 0) + 1);
			break;
		case 'mongodb':
			user[countType].set('mongodb', (user[countType].get('mongodb') || 0) + 1);
			break;
		case 'swift':
			user[countType].set('swift', (user[countType].get('swift') || 0) + 1);
			break;
		case 'ruby':
			user[countType].set('ruby', (user[countType].get('ruby') || 0) + 1);
			break;
		case 'typescript':
			user[countType].set('ts', (user[countType].get('ts') || 0) + 1);
			break;
		case 'dart':
			user[countType].set('dart', (user[countType].get('dart') || 0) + 1);
			break;
		case 'kotlin':
			user[countType].set('kt', (user[countType].get('kt') || 0) + 1);
			break;
		case 'perl':
			user[countType].set('perl', (user[countType].get('perl') || 0) + 1);
			break;
		case 'scala':
			user[countType].set('scala', (user[countType].get('scala') || 0) + 1);
			break;
		case 'julia':
			user[countType].set('julia', (user[countType].get('julia') || 0) + 1);
			break;
		default:
			return false;
	}
	return true;
};

module.exports = { updateLanguageCount };
