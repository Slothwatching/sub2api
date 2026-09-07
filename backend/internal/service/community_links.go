package service

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"unicode/utf8"
)

// CommunityLink is administrator-managed public contact information, not a ticket system.
type CommunityLink struct {
	ID       string `json:"id"`
	Platform string `json:"platform"`
	Name     string `json:"name"`
	NameEN   string `json:"name_en"`
	QRCode   string `json:"qr_code"`
	Account  string `json:"account"`
	URL      string `json:"url"`
	Status   string `json:"status"`
	Enabled  bool   `json:"enabled"`
}

func ParseCommunityLinks(raw string) []CommunityLink {
	items := []CommunityLink{}
	if json.Unmarshal([]byte(raw), &items) != nil || items == nil {
		return []CommunityLink{}
	}
	return items
}

func ValidateCommunityLinks(items []CommunityLink) error {
	if len(items) > 6 {
		return fmt.Errorf("at most 6 communities are supported")
	}
	ids := map[string]bool{}
	for _, item := range items {
		if item.ID == "" || len(item.ID) > 80 || ids[item.ID] {
			return fmt.Errorf("community IDs must be present and unique")
		}
		ids[item.ID] = true
		if utf8.RuneCountInString(item.Name) > 80 || utf8.RuneCountInString(item.NameEN) > 80 || utf8.RuneCountInString(item.Platform) > 40 || utf8.RuneCountInString(item.Account) > 200 {
			return fmt.Errorf("community text is too long")
		}
		if item.Status != "open" && item.Status != "full" && item.Status != "paused" {
			return fmt.Errorf("invalid community status")
		}
		if item.Enabled && (strings.TrimSpace(item.Name) == "" || (strings.TrimSpace(item.Account) == "" && item.QRCode == "" && item.URL == "")) {
			return fmt.Errorf("enabled communities require a name and contact method")
		}
		if item.URL != "" {
			u, err := url.Parse(item.URL)
			if err != nil || len(item.URL) > 2048 || (u.Scheme != "https" && u.Scheme != "http") || u.Hostname() == "" || u.User != nil {
				return fmt.Errorf("community links must be absolute HTTP(S) URLs without credentials")
			}
		}
		if item.QRCode != "" {
			header, encoded, ok := strings.Cut(item.QRCode, ",")
			mime := strings.TrimSuffix(strings.TrimPrefix(header, "data:"), ";base64")
			if !ok || header != "data:"+mime+";base64" || (mime != "image/png" && mime != "image/jpeg" && mime != "image/webp") || len(encoded) > 410000 {
				return fmt.Errorf("QR images must be PNG, JPG or WebP and no larger than 300KB")
			}
			data, err := base64.StdEncoding.DecodeString(encoded)
			if err != nil || len(data) > 300*1024 || http.DetectContentType(data) != mime {
				return fmt.Errorf("invalid QR image")
			}
		}
	}
	return nil
}

// Disabled and invalid drafts never leave the administrator settings API.
func PublicCommunityLinks(raw string) []CommunityLink {
	result := []CommunityLink{}
	for _, item := range ParseCommunityLinks(raw) {
		if !item.Enabled || ValidateCommunityLinks([]CommunityLink{item}) != nil {
			continue
		}
		if item.Status != "open" {
			item.QRCode = ""
			item.Account = ""
			item.URL = ""
		}
		result = append(result, item)
	}
	return result
}
func publicCommunityLinksJSON(raw string) json.RawMessage {
	data, _ := json.Marshal(PublicCommunityLinks(raw))
	return data
}
