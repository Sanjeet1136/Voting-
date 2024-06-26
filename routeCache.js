const NodeCache = require('node-cache')

const cache = new NodeCache();

const routeCache = (duration) => (req, res, next) => {
    if (req.method !== 'GET') {
        console.error('Cannot cache non-GET requests');
        return next();
}
const key = req.originalUrl;
const cacheResponse = cache.get(key);

if (cacheResponse) {
    console.log(`Cache hit for ${key}`);
    res.send(cacheResponse);
}else{
    console.log(`Cache miss for ${key}`);
    res.originalSend = res.send;
    res.send = body => {
        cache.set(key, body, duration);
        res.originalSend(body);
    }
    next();
}
}
module.exports = routeCache;