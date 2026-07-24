import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Eye,
  EyeOff,
  Key,
  Globe,
  Cpu,
  Thermometer,
  Hash,
  Zap,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { useAiProviderStore } from '@/store/aiProvider.store';
import {
  getAiSettings,
  updateAiSettings,
  testAiSettings,
} from '@/api/ai.api';
import {
  directTestConnection,
} from '@/api/aiDirect.api';
import { AI_PROVIDER_PRESETS } from '@/utils/constants';
import type { AiProviderSettingsView, UpdateAiSettingsRequest } from '@/types/ai.types';
import type { LocalAiSettings } from '@/store/aiProvider.store';

interface AiSettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function AiSettingsDrawer({ open, onClose }: AiSettingsDrawerProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.some((r) => r === 'admin' || r === 'EDUCATION_ADMIN') ?? false;

  const { settings: localSettings, saveSettings, clearSettings } = useAiProviderStore();

  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');
  const [maxTokens, setMaxTokens] = useState(700);
  const [temperature, setTemperature] = useState(0.4);
  const [showKey, setShowKey] = useState(false);

  const [adminView, setAdminView] = useState<AiProviderSettingsView | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; latencyMs: number } | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const mode: 'admin' | 'local' = isAdmin ? 'admin' : 'local';

  useEffect(() => {
    if (!open) return;

    if (mode === 'admin') {
      setAdminLoading(true);
      getAiSettings()
        .then((view) => {
          setAdminView(view);
          setBaseUrl(view.baseUrl);
          setModel(view.model);
          setMaxTokens(view.maxTokens);
          setTemperature(view.temperature);
          setApiKey('');
        })
        .catch(() => {
          toast.error('Không tải được AI settings từ server');
        })
        .finally(() => setAdminLoading(false));
    } else {
      setApiKey(localSettings.apiKey);
      setBaseUrl(localSettings.baseUrl);
      setModel(localSettings.model);
      setMaxTokens(localSettings.maxTokens);
      setTemperature(localSettings.temperature);
    }
    setTestResult(null);
    setTestError(null);
  }, [open, mode, localSettings]);

  const handlePresetSelect = useCallback((provider: keyof typeof AI_PROVIDER_PRESETS) => {
    const preset = AI_PROVIDER_PRESETS[provider];
    setBaseUrl(preset.baseUrl);
    const firstModel = preset.models[0];
    if (firstModel) {
      setModel(firstModel);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (mode === 'admin') {
      const body: UpdateAiSettingsRequest = {
        baseUrl: baseUrl.trim() || undefined,
        model: model.trim() || undefined,
        maxTokens,
        temperature,
      };
      if (apiKey.trim()) {
        body.apiKey = apiKey.trim();
      }
      try {
        const view = await updateAiSettings(body);
        setAdminView(view);
        setApiKey('');
        toast.success('Đã lưu AI settings');
      } catch {
        toast.error('Lưu settings thất bại');
      }
    } else {
      const newSettings: LocalAiSettings = {
        apiKey: apiKey.trim(),
        baseUrl: baseUrl.trim(),
        model: model.trim(),
        maxTokens,
        temperature,
      };
      saveSettings(newSettings);
      toast.success('Đã lưu AI settings (local)');
    }
  }, [mode, apiKey, baseUrl, model, maxTokens, temperature, saveSettings]);

  const handleTest = useCallback(async () => {
    setTesting(true);
    setTestResult(null);
    setTestError(null);

    try {
      if (mode === 'admin') {
        if (apiKey.trim()) {
          const result = await directTestConnection({
            apiKey: apiKey.trim(),
            baseUrl,
            model,
            maxTokens,
            temperature,
          });
          setTestResult(result);
        } else {
          const result = await testAiSettings();
          setTestResult(result);
        }
      } else {
        if (!apiKey.trim()) {
          setTestError('Vui lòng nhập API key');
          return;
        }
        const result = await directTestConnection({
          apiKey: apiKey.trim(),
          baseUrl,
          model,
          maxTokens,
          temperature,
        });
        setTestResult(result);
      }
      toast.success('Kết nối thành công!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định';
      setTestError(msg);
      toast.error(`Test thất bại: ${msg}`);
    } finally {
      setTesting(false);
    }
  }, [mode, apiKey, baseUrl, model, maxTokens, temperature]);

  const handleClear = useCallback(() => {
    if (mode === 'local') {
      clearSettings();
      setApiKey('');
      setBaseUrl('https://api.groq.com/openai/v1');
      setModel('llama-3.3-70b-versatile');
      setMaxTokens(700);
      setTemperature(0.4);
      toast.success('Đã xóa local settings');
    }
  }, [mode, clearSettings]);

  if (!open) return null;

  const currentPreset = Object.entries(AI_PROVIDER_PRESETS).find(
    ([, p]) => p.baseUrl === baseUrl,
  )?.[0] as keyof typeof AI_PROVIDER_PRESETS | undefined;

  const availableModels: readonly string[] = currentPreset
    ? AI_PROVIDER_PRESETS[currentPreset].models
    : [];

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md overflow-y-auto border-l shadow-2xl"
        style={{
          background: 'var(--app-surface)',
          borderColor: 'var(--app-border)',
        }}
        role="dialog"
        aria-label="AI Provider Settings"
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b sticky top-0 z-10"
          style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
        >
          <h2 className="text-base font-bold" style={{ color: 'var(--app-text)' }}>
            AI Provider Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--app-surface-hover)] transition-colors"
            style={{ color: 'var(--app-text-muted)' }}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--app-border)' }}>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{
              background: mode === 'admin' ? 'rgba(139,92,246,0.15)' : 'rgba(16,185,129,0.15)',
              color: mode === 'admin' ? '#a78bfa' : '#34d399',
            }}
          >
            {mode === 'admin' ? 'Admin (Server)' : 'Local (BYOK)'}
          </span>
          {mode === 'admin' && adminView && (
            <p className="text-xs mt-2" style={{ color: 'var(--app-text-subtle)' }}>
              API key: {adminView.apiKeyConfigured ? `••••${adminView.apiKeyLast4 ?? ''}` : 'Not set'}
              {' · Updated: '}
              {adminView.updatedAt ? new Date(adminView.updatedAt).toLocaleDateString() : 'N/A'}
            </p>
          )}
        </div>

        <div className="px-5 py-5 space-y-5">
          {adminLoading ? (
            <div className="flex items-center justify-center py-12" style={{ color: 'var(--app-text-subtle)' }}>
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--app-text-muted)' }}>
                  Provider
                </label>
                <div className="flex gap-2">
                  {(Object.keys(AI_PROVIDER_PRESETS) as Array<keyof typeof AI_PROVIDER_PRESETS>).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handlePresetSelect(key)}
                      className="px-3 py-2 rounded-lg text-xs font-bold border transition-colors"
                      style={{
                        borderColor: currentPreset === key ? 'var(--app-primary)' : 'var(--app-border)',
                        background: currentPreset === key ? 'rgba(16,185,129,0.12)' : 'transparent',
                        color: currentPreset === key ? 'var(--app-primary)' : 'var(--app-text-muted)',
                      }}
                    >
                      {AI_PROVIDER_PRESETS[key].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium mb-2" style={{ color: 'var(--app-text-muted)' }}>
                  <Key className="w-4 h-4" />
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={mode === 'admin' ? 'Enter new key to replace (leave blank to keep)' : 'Enter your API key'}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border text-sm outline-none transition-colors"
                    style={{
                      background: 'var(--app-surface-hover)',
                      borderColor: 'var(--app-border-strong)',
                      color: 'var(--app-text)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    style={{ color: 'var(--app-text-subtle)' }}
                    aria-label={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === 'local' && !apiKey.trim() && (
                  <p className="text-xs mt-1.5" style={{ color: 'var(--app-danger)' }}>
                    API key is required for local mode
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium mb-2" style={{ color: 'var(--app-text-muted)' }}>
                  <Globe className="w-4 h-4" />
                  Base URL
                </label>
                <input
                  type="url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.groq.com/openai/v1"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors"
                  style={{
                    background: 'var(--app-surface-hover)',
                    borderColor: 'var(--app-border-strong)',
                    color: 'var(--app-text)',
                  }}
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium mb-2" style={{ color: 'var(--app-text-muted)' }}>
                  <Cpu className="w-4 h-4" />
                  Model
                </label>
                {availableModels.length > 0 ? (
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors"
                    style={{
                      background: 'var(--app-surface-hover)',
                      borderColor: 'var(--app-border-strong)',
                      color: 'var(--app-text)',
                    }}
                  >
                    {availableModels.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    {!availableModels.includes(model) && model && (
                      <option value={model}>{model}</option>
                    )}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="model-name"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors"
                    style={{
                      background: 'var(--app-surface-hover)',
                      borderColor: 'var(--app-border-strong)',
                      color: 'var(--app-text)',
                    }}
                  />
                )}
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium mb-2" style={{ color: 'var(--app-text-muted)' }}>
                  <Thermometer className="w-4 h-4" />
                  Temperature: {temperature.toFixed(1)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.1}
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-[var(--app-primary)]"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium mb-2" style={{ color: 'var(--app-text-muted)' }}>
                  <Hash className="w-4 h-4" />
                  Max Tokens
                </label>
                <input
                  type="number"
                  min={64}
                  max={4096}
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value) || 700)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors"
                  style={{
                    background: 'var(--app-surface-hover)',
                    borderColor: 'var(--app-border-strong)',
                    color: 'var(--app-text)',
                  }}
                />
              </div>

              {testResult && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399' }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Connected — {testResult.latencyMs}ms</span>
                </div>
              )}
              {testError && (
                <div
                  className="flex items-start gap-2 px-3 py-2 rounded-lg text-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="break-words">{testError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={testing || (mode === 'local' && !apiKey.trim())}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-colors disabled:opacity-50"
                  style={{
                    borderColor: 'var(--app-border-strong)',
                    color: 'var(--app-text)',
                  }}
                >
                  {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Test
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, var(--app-primary), var(--app-accent))',
                  }}
                >
                  Save
                </button>
              </div>

              {mode === 'local' && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: 'var(--app-danger)' }}
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Local Settings
                </button>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
