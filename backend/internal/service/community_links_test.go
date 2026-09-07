package service

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestCommunityLinksValidationAndVisibility(t *testing.T) {
	base := CommunityLink{ID: "one", Name: "Community", Status: "open", Enabled: true, URL: "https://example.com/join"}
	if err := ValidateCommunityLinks([]CommunityLink{base}); err != nil {
		t.Fatal(err)
	}
	for _, url := range []string{"javascript:alert(1)", "//example.com", "https://user:secret@example.com"} {
		item := base
		item.URL = url
		if ValidateCommunityLinks([]CommunityLink{item}) == nil {
			t.Fatalf("accepted unsafe URL %q", url)
		}
	}
	if ValidateCommunityLinks([]CommunityLink{base, base}) == nil {
		t.Fatal("accepted duplicate IDs")
	}
	item := base
	item.QRCode = "data:image/svg+xml;base64,PHN2Zy8+"
	if ValidateCommunityLinks([]CommunityLink{item}) == nil {
		t.Fatal("accepted SVG")
	}
	item.QRCode = "data:image/png;base64," + strings.Repeat("A", 410001)
	if ValidateCommunityLinks([]CommunityLink{item}) == nil {
		t.Fatal("accepted oversized image")
	}
	unicodeItem := base
	unicodeItem.Platform = strings.Repeat("群", 40)
	if err := ValidateCommunityLinks([]CommunityLink{unicodeItem}); err != nil {
		t.Fatal("valid multilingual platform rejected", err)
	}
	unicodeItem.Platform += "群"
	if ValidateCommunityLinks([]CommunityLink{unicodeItem}) == nil {
		t.Fatal("overlong multilingual platform accepted")
	}
	disabled := base
	disabled.ID = "disabled"
	disabled.Enabled = false
	full := base
	full.ID = "full"
	full.Status = "full"
	full.Account = "123"
	encoded, _ := json.Marshal([]CommunityLink{base, disabled, full})
	visible := PublicCommunityLinks(string(encoded))
	if len(visible) != 2 || visible[0].ID != "one" || visible[1].ID != "full" {
		t.Fatalf("wrong visibility/order: %+v", visible)
	}
	if visible[1].URL != "" || visible[1].Account != "" || visible[1].QRCode != "" {
		t.Fatal("closed community exposes join methods")
	}
	if len(PublicCommunityLinks("invalid")) != 0 {
		t.Fatal("invalid data visible")
	}
}
