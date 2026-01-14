-- ============================================================
-- ClickHouse 查询语句备份 - Event Tracking System
-- 注意：Grafana 中每次只能执行一条查询，请复制单条使用
-- ============================================================


-- ==================== 1. 查询所有字段（完整数据）====================
-- 用途：查看完整的事件数据，包含所有37个字段

SELECT 
    event_time,
    event_date,
    event_name,
    url,
    domain,
    referrer,
    screen_width,
    hash_mode,
    int1,
    int2,
    int3,
    int4,
    int5,
    int6,
    int7,
    int8,
    int9,
    int10,
    string1,
    string2,
    string3,
    string4,
    string5,
    string6,
    string7,
    string8,
    string9,
    string10,
    ip,
    country,
    city,
    browser,
    browser_version,
    os,
    os_version,
    device_type,
    user_agent
FROM tracker.events 
ORDER BY event_time DESC 
LIMIT 100


-- ==================== 2. 日志表格视图（类似Kibana）====================
-- 用途：Grafana Table 面板，展示关键字段

SELECT 
    event_time as Time,
    event_name as Event,
    url as URL,
    browser as Browser,
    browser_version as BrowserVersion,
    os as OS,
    os_version as OSVersion,
    device_type as DeviceType,
    ip as IP,
    country as Country,
    city as City
FROM tracker.events 
ORDER BY event_time DESC 
LIMIT 100


-- ==================== 3. 事件类型统计（柱状图）====================
-- 用途：Grafana Bar Chart 面板

SELECT 
    event_name,
    count() as count
FROM tracker.events 
GROUP BY event_name
ORDER BY count DESC


-- ==================== 4. 小时趋势（时间序列图）====================
-- 用途：Grafana Time Series 面板，24小时趋势

SELECT 
    toStartOfHour(event_time) as time,
    count() as events
FROM tracker.events 
WHERE event_time >= now() - INTERVAL 24 HOUR
GROUP BY time
ORDER BY time


-- ==================== 5. 天趋势统计 ====================
-- 用途：Grafana Time Series 面板，30天趋势

SELECT 
    event_date as time,
    count() as events
FROM tracker.events 
GROUP BY event_date
ORDER BY event_date DESC
LIMIT 30


-- ==================== 6. 浏览器分布（饼图）====================
-- 用途：Grafana Pie Chart 面板

SELECT 
    browser,
    count() as count
FROM tracker.events 
GROUP BY browser
ORDER BY count DESC


-- ==================== 7. 操作系统分布 ====================
-- 用途：Grafana Pie Chart 面板

SELECT 
    os,
    count() as count
FROM tracker.events 
GROUP BY os
ORDER BY count DESC


-- ==================== 8. 设备类型分布 ====================
-- 用途：Grafana Pie Chart 面板

SELECT 
    device_type,
    count() as count
FROM tracker.events 
GROUP BY device_type
ORDER BY count DESC


-- ==================== 9. 地区分布统计 ====================
-- 用途：Grafana Table 面板

SELECT 
    country,
    city,
    count() as count
FROM tracker.events 
GROUP BY country, city
ORDER BY count DESC
LIMIT 50


-- ==================== 10. 页面访问排行 ====================
-- 用途：Grafana Table 面板，TOP 20 页面

SELECT 
    url,
    count() as visits
FROM tracker.events 
WHERE event_name = 'pageview'
GROUP BY url
ORDER BY visits DESC
LIMIT 20


-- ==================== 11. 预设业务字段查询 ====================
-- 用途：查看 int1-10, string1-10 业务自定义字段

SELECT 
    event_time,
    event_name,
    int1, int2, int3, int4, int5, int6, int7, int8, int9, int10,
    string1, string2, string3, string4, string5, string6, string7, string8, string9, string10
FROM tracker.events 
ORDER BY event_time DESC 
LIMIT 100


-- ==================== 12. 总事件数（大数字面板）====================
-- 用途：Grafana Stat 面板

SELECT count() as total FROM tracker.events


-- ==================== 13. 今日事件数 ====================
-- 用途：Grafana Stat 面板

SELECT count() as today_events 
FROM tracker.events 
WHERE event_date = today()


-- ==================== 14. 最近1小时事件数 ====================
-- 用途：Grafana Stat 面板

SELECT count() as last_hour_events 
FROM tracker.events 
WHERE event_time >= now() - INTERVAL 1 HOUR


-- ==================== 15. UV统计（按IP去重）====================
-- 用途：Grafana Time Series 面板

SELECT 
    event_date as time,
    uniq(ip) as uv
FROM tracker.events 
GROUP BY event_date
ORDER BY event_date DESC
LIMIT 30


-- ==================== 16. 查询表结构（命令行使用）====================
-- 注意：此查询仅在命令行中使用

-- DESCRIBE tracker.events


-- ==================== 17. 查询表大小（命令行使用）====================
-- 注意：此查询仅在命令行中使用

-- SELECT 
--     formatReadableSize(sum(bytes_on_disk)) as disk_size,
--     sum(rows) as total_rows
-- FROM system.parts 
-- WHERE database = 'tracker' AND table = 'events'
