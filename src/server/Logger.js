module.exports = function log(domain, msg) {
    let color = 37;
    if(domain.startsWith("Auth")) color = 34;
    if(domain.startsWith("User")) color = 34;
    if(domain.startsWith("Socket")) color = 33;
    if(domain.startsWith("Database")) color = 31;
    console.log('\x1b['+color+'m[' + domain + ']\x1b[0m', msg);
}