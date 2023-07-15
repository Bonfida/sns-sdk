package types

const (
	IPFS      = "IPFS"
	ARWV      = "ARWV"
	SOL       = "SOL"
	ETH       = "ETH"
	BTC       = "BTC"
	LTC       = "LTC"
	DOGE      = "DOGE"
	Email     = "email"
	Url       = "url"
	Discord   = "discord"
	Github    = "github"
	Reddit    = "reddit"
	Twitter   = "twitter"
	Telegram  = "telegram"
	Pic       = "pic"
	SHDW      = "SHDW"
	POINT     = "POINT"
	BSC       = "BSC"
	Injective = "INJ"
	Backpack  = "backpack"
	A         = "A"
	AAAA      = "AAAA"
	CNAME     = "CNAME"
	TXT       = "TXT"
)

var RECORD_V1_SIZE = map[string]int{
	SOL:       96,
	ETH:       20,
	BSC:       20,
	Injective: 20,
	A:         4,
	AAAA:      16,
}
