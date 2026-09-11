package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	middleware "github.com/Wei-Shaw/sub2api/internal/server/middleware"
	"github.com/Wei-Shaw/sub2api/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func TestLegacyModelListingAndExplicitAdmissionAreIndependent(t *testing.T) {
	group := &service.Group{ID: 31, Platform: service.PlatformOpenAI, ModelsListConfig: service.GroupModelsListConfig{Enabled: true, Models: []string{"gpt-5.5", "gpt-5.4"}}}
	handler := newGatewayModelsHandlerForTest(&gatewayModelsAccountRepoStub{})
	for _, restricted := range []bool{false, true} {
		group.ModelAllowlist = service.GroupModelAllowlist{Enabled: restricted, Models: []string{"gpt-5.4"}}
		recorder := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(recorder)
		ctx.Request = httptest.NewRequest(http.MethodGet, "/v1/models", nil)
		ctx.Set(string(middleware.ContextKeyAPIKey), &service.APIKey{Group: group})
		handler.Models(ctx)
		require.Equal(t, http.StatusOK, recorder.Code)
		var response gatewayModelsResponseForTest
		require.NoError(t, json.Unmarshal(recorder.Body.Bytes(), &response))
		expected := []string{"gpt-5.5", "gpt-5.4"}
		if restricted {
			expected = []string{"gpt-5.4"}
		}
		require.Equal(t, expected, modelIDsForTest(response.Data))
	}
}

func TestLegacyDisplayDoesNotBlockWebSocketRequests(t *testing.T) {
	group := wsAllowlistGroup(false)
	group.ModelsListConfig = service.GroupModelsListConfig{Enabled: true, Models: []string{"gpt-5.5"}}
	got := runOpenAIResponsesWebSocketUsageLogCase(t, openAIResponsesWSUsageLogCase{
		firstPayload: `{"type":"response.create","model":"gpt-5.4","stream":false}`,
		group:        group,
	})
	require.Len(t, got.clientEvents, 1)
}
