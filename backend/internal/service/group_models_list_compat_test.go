package service

import (
	"github.com/stretchr/testify/require"
	"testing"
)

func TestLegacyModelDisplayDoesNotAuthorizeRequests(t *testing.T) {
	group := &Group{ModelsListConfig: GroupModelsListConfig{Enabled: true, Models: []string{"gpt-5.5", "gpt-5.4"}}}
	require.False(t, group.ModelAllowlistEnabled())
	require.True(t, group.ModelAllowlist.Allows("unlisted-model"))
	source := []string{"gpt-5.4", "unlisted-model", "gpt-5.5"}
	require.Equal(t, []string{"gpt-5.5", "gpt-5.4"}, group.ModelListingAllowlist().FilterForListing(source))

	group.ModelAllowlist = GroupModelAllowlist{Enabled: true, Models: []string{"gpt-5.4"}}
	require.False(t, group.ModelAllowlist.Allows("gpt-5.5"))
	require.Equal(t, []string{"gpt-5.4"}, group.ModelListingAllowlist().FilterForListing(source))
	group.ModelsListConfig.Models = []string{"unlisted-model"}
	require.Empty(t, group.ModelListingAllowlist().FilterForListing(source))
}

func TestLegacyEmptyModelDisplayRemainsDisabled(t *testing.T) {
	group := &Group{ModelsListConfig: GroupModelsListConfig{Enabled: true}}
	require.False(t, group.ModelListingEnabled())
	require.True(t, group.ModelAllowlist.Allows("gpt-5.5"))
	group.ModelAllowlist = GroupModelAllowlist{Enabled: true, Models: []string{"gpt-5.5"}}
	require.True(t, group.ModelListingEnabled())
	require.False(t, group.ModelAllowlist.Allows("other"))
}
