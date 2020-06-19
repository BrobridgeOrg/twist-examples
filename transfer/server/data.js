
const Data = module.exports = {
	accounts: {},
};

const createAccount = function(username, initialBalance) {
	Data.accounts[username] = {
		balance: initialBalance,
		reserved: 0,
	};
}

// Initializing accounts for testing
createAccount('fred', 5000);
createAccount('armani', 1000);
