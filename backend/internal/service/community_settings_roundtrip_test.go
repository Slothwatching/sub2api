//go:build unit

package service

import (
	"context"
	"encoding/json"
	"github.com/Wei-Shaw/sub2api/internal/config"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestCommunitySettingsRoundTrip(t *testing.T) {
	ctx := context.Background()
	raw := `[{"id":"first","platform":"Chat","name":"Community","name_en":"","account":"123","url":"","qr_code":"","status":"open","enabled":true}]`
	repo := &settingUpdateRepoStub{}
	svc := NewSettingService(repo, &config.Config{})
	require.NoError(t, svc.UpdateSettings(ctx, &SystemSettings{CommunityLinks: raw}))
	require.Equal(t, raw, repo.updates[SettingKeyCommunityLinks])
	publicSvc := NewSettingService(&settingPublicRepoStub{values: repo.updates}, &config.Config{})
	settings, err := publicSvc.GetPublicSettings(ctx)
	require.NoError(t, err)
	require.Equal(t, raw, settings.CommunityLinks)
	var visible []CommunityLink
	require.NoError(t, json.Unmarshal(publicCommunityLinksJSON(settings.CommunityLinks), &visible))
	require.Len(t, visible, 1)
	require.Equal(t, "first", visible[0].ID)
}
