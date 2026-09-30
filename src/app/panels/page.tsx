'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PanelsHeader } from '@/features/panels/components/panels-header';
import { PanelsDirectoryList } from '@/features/panels/components/panels-directory-list';
import { PanelConfigEditor } from '@/features/panels/components/panel-config-editor';
import { CreatePanelModal } from '@/features/panels/components/create-panel-modal';
import {
  usePanelsCatalog,
  useCreatePanel,
  useUpdatePanel,
  DEMO_MASTER_PANELS,
} from '@/features/panels/api/use-panels-catalog';
import { RoleGate } from '@/features/auth/components/role-gate';
import { AccessDeniedView } from '@/features/auth/components/access-denied';
import type { MasterPanel } from '@/features/panels/types';

export default function PanelsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedPanelId, setSelectedPanelId] = React.useState<string>(DEMO_MASTER_PANELS[0].id);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [activeMobileView, setActiveMobileView] = React.useState<'list' | 'editor'>('list');

  const { data: panels = DEMO_MASTER_PANELS, isLoading } = usePanelsCatalog(selectedCategory);
  const createPanelMutation = useCreatePanel();
  const updatePanelMutation = useUpdatePanel();

  // Filter panels by search query
  const filteredPanels = React.useMemo(() => {
    return panels.filter((panel) => {
      const matchesSearch =
        panel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        panel.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        panel.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [panels, searchQuery]);

  // Selected panel details
  const selectedPanel = React.useMemo(() => {
    return panels.find((p) => p.id === selectedPanelId) || panels[0] || DEMO_MASTER_PANELS[0];
  }, [panels, selectedPanelId]);

  const handleSelectPanel = (id: string) => {
    setSelectedPanelId(id);
    setActiveMobileView('editor');
  };

  const handleSavePanel = (updated: Partial<MasterPanel>) => {
    if (!selectedPanel) return;
    updatePanelMutation.mutate({
      id: selectedPanel.id,
      dto: updated,
    });
  };

  return (
    <AppShell variant="workspace">
      <RoleGate
        allowedRoles={['OWNER']}
        fallback={
          <AccessDeniedView
            requiredRoles={['OWNER']}
            customMessage="Master diagnostic test definitions, parameter configurations, and retail price catalogs are restricted to the Lab Director / Owner."
          />
        }
      >
        <div className="flex flex-col w-full h-full min-h-0 overflow-hidden">
          {/* Top Header - Fixed & Pinned */}
          <PanelsHeader
            totalCount={panels.length}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onCreateClick={() => setIsCreateModalOpen(true)}
          />

          {/* Mobile View Toggle (visible only below xl) */}
          <div className="xl:hidden flex items-center bg-muted/60 p-1 mx-4 mt-2 mb-1 rounded-lg border border-border shrink-0">
            <button
              type="button"
              onClick={() => setActiveMobileView('list')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeMobileView === 'list'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Panel Directory ({filteredPanels.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveMobileView('editor')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeMobileView === 'editor'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Config Editor ({selectedPanel.code})
            </button>
          </div>

          {/* Main Workstation Studio Layout */}
          <main className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-12 overflow-hidden divide-y xl:divide-y-0 xl:divide-x divide-border">
            {/* Left Column: Panel Directory (Independent Scroll) */}
            <div
              className={`xl:col-span-4 2xl:col-span-3.5 h-full min-h-0 overflow-hidden ${
                activeMobileView === 'list' ? 'flex flex-col' : 'hidden xl:flex xl:flex-col'
              }`}
            >
              <PanelsDirectoryList
                panels={filteredPanels}
                selectedPanelId={selectedPanel.id}
                onSelectPanel={handleSelectPanel}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>

            {/* Right Column: Panel Configuration Editor (Independent Scroll) */}
            <div
              className={`xl:col-span-8 2xl:col-span-8.5 h-full min-h-0 overflow-y-auto bg-muted/10 ${
                activeMobileView === 'editor' ? 'block' : 'hidden xl:block'
              }`}
            >
              <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
                {isLoading ? (
                  <div className="bg-card rounded-lg p-12 border border-border flex items-center justify-center font-mono text-xs text-muted-foreground">
                    <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin mr-3" />
                    Loading panel configuration...
                  </div>
                ) : (
                  <PanelConfigEditor
                    key={selectedPanel.id}
                    panel={selectedPanel}
                    onSave={handleSavePanel}
                    onBack={() => setActiveMobileView('list')}
                    isSaving={updatePanelMutation.isPending}
                  />
                )}
              </div>
            </div>
          </main>

          {/* Create Panel Modal */}
          <CreatePanelModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={(dto) => createPanelMutation.mutate(dto)}
            isCreating={createPanelMutation.isPending}
          />
        </div>
      </RoleGate>
    </AppShell>
  );
}
