import requests
import time
import pymongo
from bs4 import BeautifulSoup as soup

client = pymongo.MongoClient("mongodb://mongo:27017/crypto")
print("client: ", client)
db = client['crypto']
cryptos = db['cryptos']

my_url = "https://finance.yahoo.com/cryptocurrencies?offset=0&count=60"

starttime = time.time()
print("Started...")

while True:
    # uClient = uReq(my_url)
    # page_html = uClient.read()
    # uClient.close()
    response = requests.get(my_url)

    # HTML parsing
    page_soup = soup(response.text, "html.parser")

    # Grabs each row
    containers = page_soup.findAll("tr", {"class": "simpTblRow Bgc($hoverBgColor):h BdB Bdbc($seperatorColor) Bdbc($tableBorderBlue):h H(32px) Bgc($lv2BgColor)"})
    containers2 = page_soup.findAll("tr", {"class":"simpTblRow Bgc($hoverBgColor):h BdB Bdbc($seperatorColor) Bdbc($tableBorderBlue):h H(32px) Bgc($lv1BgColor)"})

    for container in containers:
        name = container.td.a["title"]
        name = name.replace("USD", "")
        price = container.span.text
        price = price.replace(',', '')
        change_container = container.findAll("td", {"class", "Va(m) Ta(end) Pstart(20px) Fw(600) Fz(s)"})
        change = change_container[1].text
        change_percent = change_container[2].text
        market_container = container.findAll("td", {"class", "Va(m) Ta(end) Pstart(20px) Fz(s)"})
        market_cap = market_container[0].text
        abbrContainer = container.findAll("a", {"class", "Fw(600) C($linkColor)"})
        abbr = abbrContainer[0].text.replace("-USD", "")
        try:
            logo_container = container.findAll("img", {"class":"W(20px) H(20px) Mend(5px)"})
            logo = logo_container[0].get('src')
        except:
            continue

        crypto1 = {
            'name': name.strip(),
            'abbr': abbr,
            'change': change,
            'change_percent': change_percent,
            'market_cap': market_cap,
            'price': float(price),
            'logo': logo
        }

        if abbr and name:
            doc = cryptos.find_one_and_update(
                {"abbr": crypto1["abbr"]},
                {"$set":
                     {"name": crypto1["name"],
                      "price": crypto1["price"],
                      "change": crypto1["change"],
                      "change_percent": crypto1["change_percent"],
                      "market_cap": crypto1["market_cap"],
                      "logo": crypto1["logo"]
                      }
                 }, upsert=True
            )

            # if doc == None:
        #cryptos.insert_one(crypto1)
        
    for container in containers2:
        name = container.td.a["title"]
        name = name.replace("USD", "")
        price = container.span.text
        price = price.replace(',', '')
        change_container = container.findAll("td", {"class", "Va(m) Ta(end) Pstart(20px) Fw(600) Fz(s)"})
        change = change_container[1].text
        change_percent = change_container[2].text
        market_container = container.findAll("td", {"class", "Va(m) Ta(end) Pstart(20px) Fz(s)"})
        market_cap = market_container[0].text
        abbrContainer = container.findAll("a", {"class", "Fw(600) C($linkColor)"})
        abbr = abbrContainer[0].text.replace("-USD", "")
        try:
            logo_container = container.findAll("img", {"class": "W(20px) H(20px) Mend(5px)"})
            logo = logo_container[0].get('src')
        except:
            continue

        crypto2 = {
            'name': name.replace("USD", "").strip(),
            'abbr': abbr,
            'change': change,
            'change_percent': change_percent,
            'market_cap': market_cap,
            'price': float(price),
            'logo': logo
        }

        if abbr and name:
            doc = cryptos.find_one_and_update(
                {"abbr": crypto2["abbr"]},
                {"$set":
                     {"name": crypto2["name"],
                      "price": crypto2["price"],
                      "change": crypto2["change"],
                      "change_percent": crypto2["change_percent"],
                      "market_cap": crypto2["market_cap"],
                      "logo": crypto2["logo"]
                      }
                 }, upsert=True
            )

        #     if doc == None:
        # cryptos.insert_one(crypto2)

    time.sleep(60.0 - ((time.time() - starttime) % 60.0))
