-- KEYS[1] = Redis key
-- ARGV[1] = Maximum allowed requests
-- ARGV[2] = Window duration in seconds

local current = redis.call('INCR', KEYS[1]);

-- initialize
if current == 1 then
    redis.call("EXPIRE", KEYS[1], ARGV[2])
end

local ttl = redis.call('TTL', KEYS[1])

local remaining = tonumber(ARGV[1]) - current

if remaining < 0 then
    remaining = 0
end

return {current, remaining, ttl}

