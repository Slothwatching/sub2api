package service

import "strings"

func normalizeGroupModelsListConfig(cfg GroupModelsListConfig) GroupModelsListConfig {
	out := GroupModelsListConfig{Enabled: cfg.Enabled}
	if len(cfg.Models) == 0 {
		return out
	}

	seen := make(map[string]struct{}, len(cfg.Models))
	out.Models = make([]string, 0, len(cfg.Models))
	for _, model := range cfg.Models {
		model = strings.TrimSpace(model)
		if model == "" {
			continue
		}
		if _, ok := seen[model]; ok {
			continue
		}
		seen[model] = struct{}{}
		out.Models = append(out.Models, model)
	}
	if len(out.Models) == 0 {
		out.Models = nil
	}
	return out
}

func (g *Group) CustomModelsListEnabled() bool {
	return g != nil && g.ModelsListConfig.Enabled && len(g.ModelsListConfig.Models) > 0
}

// Discovery may be narrower than admission. Legacy display settings never
// participate in request authorization; an explicit allowlist still bounds them.
func (g *Group) ModelListingAllowlist() GroupModelAllowlist {
	if g == nil {
		return GroupModelAllowlist{}
	}
	if !g.CustomModelsListEnabled() {
		return g.ModelAllowlist
	}
	selection := GroupModelAllowlist{Enabled: true}
	for _, model := range g.ModelsListConfig.Models {
		if g.ModelAllowlist.Allows(model) {
			selection.Models = append(selection.Models, model)
		}
	}
	return selection
}

func (g *Group) ModelListingEnabled() bool {
	return g.ModelListingAllowlist().Enabled
}
