function operator(proxies) {
  const countryCodes = {
    '🇺🇸': 'US', '🇭🇰': 'HK', '🇨🇳': 'CN', '🇸🇬': 'SG', '🇯🇵': 'JP',
    '🇬🇧': 'UK', '🇹🇼': 'TW', '🇰🇷': 'KR', '🇦🇺': 'AU', '🇩🇪': 'DE',
    '🇫🇷': 'FR', '🇮🇳': 'IN', '🇮🇹': 'IT', '🇷🇺': 'RU', '🇨🇦': 'CA',
    '🇧🇷': 'BR', '🇹🇷': 'TR', '🇳🇱': 'NL', '🇵🇭': 'PH', '🇹🇭': 'TH',
    '🇻🇳': 'VN', '🇮🇩': 'ID', '🇲🇾': 'MY'
  };

  const domainSuffixToCountry = {
    '.us': 'US', '.hk': 'HK', '.jp': 'JP', '.sg': 'SG', '.tw': 'TW',
    '.kr': 'KR', '.uk': 'UK', '.de': 'DE', '.fr': 'FR', '.ca': 'CA',
    '.au': 'AU', '.ru': 'RU', '.in': 'IN'
  };

  const countryCount = {};

  function ipToLong(ip) {
    let segments = ip.split('.');
    if (segments.length !== 4) return 0;
    return ((parseInt(segments[0]) << 24) |
            (parseInt(segments[1]) << 16) |
            (parseInt(segments[2]) << 8) |
            parseInt(segments[3])) >>> 0;
  }

  function getCountryFromIP(ip) {
    const ipMappings = [
      { range: [ipToLong("1.0.0.0"), ipToLong("1.255.255.255")], country: "CN" },
      { range: [ipToLong("2.0.0.0"), ipToLong("2.255.255.255")], country: "FR" },
      { range: [ipToLong("3.0.0.0"), ipToLong("3.255.255.255")], country: "US" },
      { range: [ipToLong("8.0.0.0"), ipToLong("8.255.255.255")], country: "US" },
      { range: [ipToLong("13.0.0.0"), ipToLong("13.255.255.255")], country: "US" },
      { range: [ipToLong("18.0.0.0"), ipToLong("18.255.255.255")], country: "US" },
      { range: [ipToLong("23.0.0.0"), ipToLong("23.255.255.255")], country: "US" },
      { range: [ipToLong("45.0.0.0"), ipToLong("45.255.255.255")], country: "US" },
      { range: [ipToLong("52.0.0.0"), ipToLong("54.255.255.255")], country: "US" },
      { range: [ipToLong("64.0.0.0"), ipToLong("65.255.255.255")], country: "US" },
      { range: [ipToLong("96.0.0.0"), ipToLong("99.255.255.255")], country: "US" },
      { range: [ipToLong("104.0.0.0"), ipToLong("104.255.255.255")], country: "US" },
      { range: [ipToLong("162.0.0.0"), ipToLong("162.255.255.255")], country: "US" },
      { range: [ipToLong("172.0.0.0"), ipToLong("172.255.255.255")], country: "US" },
      { range: [ipToLong("14.0.0.0"), ipToLong("14.255.255.255")], country: "JP" },
      { range: [ipToLong("27.0.0.0"), ipToLong("27.255.255.255")], country: "KR" },
      { range: [ipToLong("36.0.0.0"), ipToLong("36.255.255.255")], country: "CN" },
      { range: [ipToLong("42.0.0.0"), ipToLong("42.255.255.255")], country: "KR" },
      { range: [ipToLong("49.0.0.0"), ipToLong("49.255.255.255")], country: "TW" },
      { range: [ipToLong("58.0.0.0"), ipToLong("59.255.255.255")], country: "CN" },
      { range: [ipToLong("60.0.0.0"), ipToLong("60.255.255.255")], country: "JP" },
      { range: [ipToLong("103.0.0.0"), ipToLong("103.255.255.255")], country: "HK" },
      { range: [ipToLong("118.0.0.0"), ipToLong("118.255.255.255")], country: "SG" },
      { range: [ipToLong("122.0.0.0"), ipToLong("122.255.255.255")], country: "TW" },
      { range: [ipToLong("124.0.0.0"), ipToLong("124.255.255.255")], country: "JP" },
      { range: [ipToLong("125.0.0.0"), ipToLong("125.255.255.255")], country: "KR" },
      { range: [ipToLong("175.0.0.0"), ipToLong("175.255.255.255")], country: "SG" },
      { range: [ipToLong("180.0.0.0"), ipToLong("180.255.255.255")], country: "JP" },
      { range: [ipToLong("182.0.0.0"), ipToLong("182.255.255.255")], country: "HK" },
      { range: [ipToLong("203.0.0.0"), ipToLong("203.255.255.255")], country: "AU" },
      { range: [ipToLong("210.0.0.0"), ipToLong("210.255.255.255")], country: "KR" },
      { range: [ipToLong("211.0.0.0"), ipToLong("211.255.255.255")], country: "JP" },
      { range: [ipToLong("223.0.0.0"), ipToLong("223.255.255.255")], country: "HK" }
    ];

    const ipNum = ipToLong(ip);
    for (const mapping of ipMappings) {
      if (ipNum >= mapping.range[0] && ipNum <= mapping.range[1]) {
        return mapping.country;
      }
    }
    return null;
  }

  function getCountryFromServer(proxy) {
    for (const [emoji, code] of Object.entries(countryCodes)) {
      if (proxy.name && proxy.name.includes(emoji)) {
        return code;
      }
    }

    if (proxy.server) {
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      const serverLower = proxy.server.toLowerCase();

      // 新增：优先根据域名后缀判断国家
      for (const [suffix, code] of Object.entries(domainSuffixToCountry)) {
        if (serverLower.endsWith(suffix) || serverLower.includes(`.${suffix.replace('.', '')}.`)) {
          return code;
        }
      }

      if (ipRegex.test(proxy.server)) {
        const ipCountry = getCountryFromIP(proxy.server);
        if (ipCountry) return ipCountry;
      }
    }

    return 'UN';
  }

  const countryNames = {
    'US': '美国', 'HK': '香港', 'CN': '中国', 'SG': '新加坡', 'JP': '日本',
    'UK': '英国', 'TW': '台湾', 'KR': '韩国', 'AU': '澳大利亚', 'DE': '德国',
    'FR': '法国', 'IN': '印度', 'IT': '意大利', 'RU': '俄罗斯', 'CA': '加拿大',
    'BR': '巴西', 'TR': '土耳其', 'NL': '荷兰', 'PH': '菲律宾', 'TH': '泰国',
    'VN': '越南', 'ID': '印尼', 'MY': '马来西亚', 'UN': '阿根廷'
  };

  function formatCount(count) {
    return count < 10 ? `0${count}` : `${count}`;
  }

  proxies.forEach(proxy => {
    const countryCode = getCountryFromServer(proxy);
    if (!countryCount[countryCode]) countryCount[countryCode] = 1;
    else countryCount[countryCode]++;
    const countryName = countryNames[countryCode] || '';
    proxy.name = `${countryCode}${countryName}${formatCount(countryCount[countryCode])}`;
  });

  return proxies;
}

operator;
