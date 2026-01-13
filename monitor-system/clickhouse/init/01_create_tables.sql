CREATE DATABASE IF NOT EXISTS tracker;

CREATE TABLE IF NOT EXISTS tracker.events
(
    event_time DateTime64(3) DEFAULT now64(3),
    event_date Date DEFAULT toDate(event_time),
    event_name LowCardinality(String),
    url String,
    domain LowCardinality(String),
    referrer String,
    screen_width UInt16,
    hash_mode UInt8,
    
    int1 Int64 DEFAULT 0,
    int2 Int64 DEFAULT 0,
    int3 Int64 DEFAULT 0,
    int4 Int64 DEFAULT 0,
    int5 Int64 DEFAULT 0,
    int6 Int64 DEFAULT 0,
    int7 Int64 DEFAULT 0,
    int8 Int64 DEFAULT 0,
    int9 Int64 DEFAULT 0,
    int10 Int64 DEFAULT 0,
    
    string1 String DEFAULT '',
    string2 String DEFAULT '',
    string3 String DEFAULT '',
    string4 String DEFAULT '',
    string5 String DEFAULT '',
    string6 String DEFAULT '',
    string7 String DEFAULT '',
    string8 String DEFAULT '',
    string9 String DEFAULT '',
    string10 String DEFAULT '',
    
    ip String,
    country LowCardinality(String) DEFAULT '',
    city String DEFAULT '',
    
    browser LowCardinality(String) DEFAULT '',
    browser_version String DEFAULT '',
    os LowCardinality(String) DEFAULT '',
    os_version String DEFAULT '',
    device_type LowCardinality(String) DEFAULT 'desktop',
    
    user_agent String
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_date, event_name, event_time)
TTL event_date + INTERVAL 90 DAY
SETTINGS index_granularity = 8192;

CREATE TABLE IF NOT EXISTS tracker.events_buffer AS tracker.events
ENGINE = Buffer(tracker, events, 16, 10, 100, 10000, 1000000, 10000000, 100000000);
