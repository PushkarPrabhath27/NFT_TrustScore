import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import random


def fetch_hathor_nft(uid):
    base_url = f"https://explorer.hathor.network/token_detail/{uid}"
    api_url = f"https://explorer-api.hathor.network/v1a/token?token_id={uid}"

    try:
        api_resp = requests.get(api_url)
        api_resp.raise_for_status()
        data = api_resp.json()
    except:
        data = None

    if not data:
        html = requests.get(base_url).text
        soup = BeautifulSoup(html, 'html.parser')

        def get_text(label):
            el = soup.find("div", string=label)
            if el:
                next_div = el.find_next("div")
                return next_div.text.strip() if next_div else None
            return None

        name = get_text("Token name")
        symbol = get_text("Symbol")
        totalSupply = int(get_text("Total supply") or 1)
        canMint = get_text("Can mint new tokens") == 'Yes'
        canMelt = get_text("Can melt tokens") == 'Yes'
        config_str = get_text("Configuration string") or ""
        tx_elements = soup.select('a[href*="/transaction/"]')
        tx_hashes = list(set(el.text.strip() for el in tx_elements if len(el.text.strip()) == 64))
        tx_dates = [
            datetime.strptime(el.find_parent("div").find_next("div").text.strip(), "%b %d, %Y")
            for el in tx_elements if len(el.text.strip()) == 64
        ]
    else:
        name = data.get("name")
        symbol = data.get("symbol")
        totalSupply = int(data.get("total", 1))
        canMint = data.get("can_mint", False)
        canMelt = data.get("can_melt", False)
        config_str = data.get("token_data", {}).get("config") or ""

        # fallback HTML parse for TX history
        html = requests.get(base_url).text
        soup = BeautifulSoup(html, 'html.parser')
        tx_elements = soup.select('a[href*="/transaction/"]')
        tx_hashes = list(set(el.text.strip() for el in tx_elements if len(el.text.strip()) == 64))
        tx_dates = [
            datetime.strptime(el.find_parent("div").find_next("div").text.strip(), "%b %d, %Y")
            for el in tx_elements if len(el.text.strip()) == 64
        ]

    verified = not canMint and not canMelt
    token_id = f"{uid[:8]}...{uid[-8:]}"
    collection = name.split("#")[0].strip() if name and '#' in name else name.strip()
    creator = "Unknown Creator"
    transactionsCount = len(tx_hashes)
    transactionHistory = [
        {"hash": h, "date": d.strftime("%Y-%m-%d")} for h, d in zip(tx_hashes, tx_dates)
    ]

    if tx_dates:
        first_tx_date = min(tx_dates)
    else:
        first_tx_date = datetime.today()

    age_months = max(1, (datetime.today().year - first_tx_date.year) * 12 + datetime.today().month - first_tx_date.month)
    age_points = min(age_months, 25)
    tx_points = min(2 * transactionsCount, 25)
    immutability_points = 25 if verified else (12 if canMint != canMelt else 0)
    score = min(100, 50 + age_points + tx_points + immutability_points)

    trustScoreData = {
        "score": score,
        "confidenceLevel": score,
        "factors": [
            {"name": "Age", "score": age_points, "description": "Age in months since first TX", "impact": "Medium"},
            {"name": "Transaction History", "score": tx_points, "description": "Number of transactions", "impact": "High"},
            {"name": "Immutability", "score": immutability_points, "description": "Mint/melt disabled", "impact": "High"},
        ],
        "history": [
            {"date": (first_tx_date + relativedelta(months=i)).strftime("%Y-%m"), "score": min(100, 50 + min(i, 25) + tx_points + immutability_points)}
            for i in range(age_months)
        ],
        "strengths": [s for s in ["Strong immutability" if immutability_points == 25 else None, "Good transaction history" if tx_points >= 20 else None] if s],
        "concerns": ["Low age" if age_points < 5 else None]
    }

    return {
        "nftData": {
            "id": uid,
            "name": name,
            "symbol": symbol,
            "totalSupply": totalSupply,
            "canMint": canMint,
            "canMelt": canMelt,
            "configurationString": config_str,
            "blockchain": "Hathor",
            "verified": verified,
            "tokenId": token_id,
            "collection": collection,
            "creator": creator,
            "transactionsCount": transactionsCount,
            "transactionHistory": transactionHistory,
            "trustScore": score,
            "trustScoreData": trustScoreData,
            "priceData": {}  # You can extend this function to calculate priceData later based on real or simulated economics
        }
    }


# Example usage:
# result = fetch_hathor_nft("0002b13f155bf5e391b003a610bc902848e9a58c758889f81e17a5c031fe5c76")
# print(json.dumps(result, indent=2))
