import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  Eraser,
  MapPin,
  Pencil,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import {
  calculateRoute,
  INITIAL_FEE_MATRIX,
  PREFECTURES,
  REGIONS,
  searchPrefectures,
  type Fee,
  type FeeChange,
  type FeeMatrix,
  type Prefecture,
  type Region,
} from '@/data/prefecture-master';
const REGION_COLORS: Record<Region, string> = {
  北海道: 'bg-sky-100 text-sky-800',
  本州: 'bg-amber-100 text-amber-900',
  九州: 'bg-emerald-100 text-emerald-800',
  沖縄: 'bg-rose-100 text-rose-800',
};

type LocationFieldProps = {
  label: string;
  eyebrow: string;
  value: string;
  selected: Prefecture | null;
  onChange: (value: string) => void;
  onSelect: (prefecture: Prefecture) => void;
};

function LocationField({
  label,
  eyebrow,
  value,
  selected,
  onChange,
  onSelect,
}: LocationFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const candidates = useMemo(() => searchPrefectures(value).slice(0, 7), [value]);

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between">
        <label
          htmlFor={`prefecture-${eyebrow}`}
          className="text-sm font-extrabold tracking-tight text-[hsl(var(--foreground))]"
        >
          {label}
        </label>
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
          {eyebrow}
        </span>
      </div>
      <div
        className={`focus-ring flex items-center gap-3 rounded-[0.8rem] border bg-[hsl(var(--card))] px-4 py-3 transition-all ${
          isOpen
            ? 'border-[hsl(var(--accent))] shadow-[0_8px_24px_hsl(var(--accent)/.08)]'
            : 'border-[hsl(var(--input))]'
        }`}
      >
        <Search className="h-[18px] w-[18px] shrink-0 text-[hsl(var(--muted-foreground))]" />
        <input
          id={`prefecture-${eyebrow}`}
          data-testid={`input-${eyebrow}`}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setIsOpen(false);
            if (event.key === 'Enter' && candidates[0]) {
              onSelect(candidates[0]);
              setIsOpen(false);
            }
          }}
          placeholder="都道府県名・読みで検索"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-[hsl(var(--foreground))] outline-none placeholder:font-medium placeholder:text-[hsl(var(--muted-foreground))]"
        />
        {value && (
          <button
            type="button"
            data-testid={`button-clear-${eyebrow}`}
            aria-label={`${label}をクリア`}
            onClick={() => {
              onChange('');
              setIsOpen(true);
            }}
            className="rounded-full p-1 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <ChevronDown
          className={`h-[17px] w-[17px] shrink-0 text-[hsl(var(--muted-foreground))] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>
      {selected && !isOpen && (
        <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
          <Check className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
          地点を確定しました
          <span className="text-[hsl(var(--border))]">/</span>
          <span
            data-testid={`text-region-${eyebrow}`}
            className={`rounded-full px-2 py-1 text-[10px] font-bold ${REGION_COLORS[selected.region]}`}
          >
            {selected.region}エリア
          </span>
        </div>
      )}
      {isOpen && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-[0.8rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-1.5 shadow-[0_18px_42px_hsl(220_34%_17%/.16)]">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">
              候補 {candidates.length}件
            </span>
            {value && (
              <span className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">
                Enterで先頭を確定
              </span>
            )}
          </div>
          {candidates.length > 0 ? (
            candidates.map((prefecture) => (
              <button
                key={prefecture.name}
                type="button"
                data-testid={`candidate-${eyebrow}-${prefecture.name}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(prefecture);
                  setIsOpen(false);
                }}
                className="group flex w-full items-center gap-3 rounded-[0.55rem] px-3 py-2.5 text-left transition-colors hover:bg-[hsl(var(--secondary))]"
              >
                <MapPin className="h-4 w-4 text-[hsl(var(--accent))] transition-transform group-hover:-translate-y-0.5" />
                <span className="flex-1">
                  <span className="block text-sm font-bold text-[hsl(var(--foreground))]">
                    {prefecture.name}
                  </span>
                  <span className="block text-[11px] font-medium tracking-wide text-[hsl(var(--muted-foreground))]">
                    {prefecture.reading}
                  </span>
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-bold ${REGION_COLORS[prefecture.region]}`}
                >
                  {prefecture.region}
                </span>
              </button>
            ))
          ) : (
            <div className="px-3 pb-3 pt-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">
              一致する都道府県がありません
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultPanel({
  departure,
  arrival,
  feeMatrix,
}: {
  departure: Prefecture | null;
  arrival: Prefecture | null;
  feeMatrix: FeeMatrix;
}) {
  const result =
    departure && arrival ? calculateRoute(departure, arrival, feeMatrix) : null;
  const isEmpty = !departure && !arrival;
  const isPartial = (departure && !arrival) || (!departure && arrival);

  return (
    <section className="relative min-h-[365px] overflow-hidden rounded-[1.15rem] bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))] shadow-[0_16px_40px_hsl(220_34%_17%/.17)] sm:p-8">
      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border-[18px] border-[hsl(var(--accent)/.16)]" />
      <div className="absolute -bottom-24 -left-20 h-52 w-52 rounded-full border-[1px] border-[hsl(var(--primary-foreground)/.1)]" />
      <div className="relative flex h-full min-h-[317px] flex-col">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[hsl(var(--primary-foreground)/.62)]">
              Dispatch output / 01
            </span>
            <h2 className="mt-3 text-xl font-extrabold tracking-tight">確認結果</h2>
          </div>
          <div className="rounded-full border border-[hsl(var(--primary-foreground)/.18)] p-2.5">
            <ClipboardCheck className="h-5 w-5 text-[hsl(var(--accent))]" />
          </div>
        </div>

        {result ? (
          <div className="rise-in mt-auto">
            <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-[hsl(var(--primary-foreground)/.68)]">
              <span>{result.departure.name}</span>
              <span className="route-line h-px w-8" />
              <span>{result.arrival.name}</span>
            </div>
            <div className="flex items-end justify-between gap-3">
              <div>
                {result.fee !== null ? (
                  <>
                    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--accent))]">
                      適用料金
                    </p>
                    <p
                      data-testid="text-route-fee"
                      className="mt-1 text-[clamp(2.7rem,6vw,4.6rem)] font-extrabold leading-none tracking-[-0.07em]"
                    >
                      ¥{result.fee.toLocaleString('ja-JP')}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--primary-foreground)/.62)]">
                      マスタ登録
                    </p>
                    <p
                      data-testid="status-no-fee"
                      className="mt-2 text-3xl font-extrabold leading-none tracking-[-0.04em] text-[hsl(var(--primary-foreground)/.82)]"
                    >
                      料金設定なし
                    </p>
                  </>
                )}
              </div>
              <span className="mb-1 rounded-full bg-[hsl(var(--primary-foreground)/.1)] px-3 py-1.5 text-[11px] font-bold">
                {result.category}
              </span>
            </div>
            <div className="mt-6 flex items-center gap-2 border-t border-[hsl(var(--primary-foreground)/.14)] pt-4 text-xs font-medium text-[hsl(var(--primary-foreground)/.62)]">
              <ShieldCheck className="h-4 w-4 text-[hsl(var(--accent))]" />
              最新の料金マスタを参照しています
            </div>
          </div>
        ) : (
          <div className="mt-auto">
            <div
              data-testid="status-route-progress"
              className="flex h-[150px] flex-col justify-end"
            >
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.17em] text-[hsl(var(--accent))]">
                {isPartial ? 'もう一地点' : 'Route ready'}
              </p>
              <p className="mt-3 max-w-[330px] text-2xl font-extrabold leading-[1.18] tracking-[-0.04em]">
                {isEmpty
                  ? '出発地と到着地を選択してください'
                  : '到着地を選ぶと料金を照合します'}
              </p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-[hsl(var(--primary-foreground)/.62)]">
                {isEmpty
                  ? '確定した地点だけが結果に反映されます。'
                  : '候補から都道府県を確定してください。'}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 border-t border-[hsl(var(--primary-foreground)/.14)] pt-4 text-xs font-medium text-[hsl(var(--primary-foreground)/.55)]">
              <CircleHelp className="h-4 w-4" />
              読み方でも検索できます
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function formatFee(fee: Fee) {
  return fee === null ? '未設定' : `${fee.toLocaleString('ja-JP')}円`;
}

function FeeMasterPanel({
  feeMatrix,
  history,
  onUpdateFee,
}: {
  feeMatrix: FeeMatrix;
  history: FeeChange[];
  onUpdateFee: (departure: Region, arrival: Region, fee: Fee) => void;
}) {
  const [editing, setEditing] = useState<{ departure: Region; arrival: Region } | null>(null);
  const [draftFee, setDraftFee] = useState('');
  const [validationMessage, setValidationMessage] = useState('');

  const openEditor = (departure: Region, arrival: Region) => {
    const fee = feeMatrix[departure][arrival];
    setEditing({ departure, arrival });
    setDraftFee(fee === null ? '' : String(fee));
    setValidationMessage('');
  };

  const saveDraft = () => {
    if (!editing) return;
    const normalized = draftFee.trim();
    if (normalized !== '' && !/^\d+$/.test(normalized)) {
      setValidationMessage('0以上の整数、または空欄で入力してください。');
      return;
    }
    onUpdateFee(
      editing.departure,
      editing.arrival,
      normalized === '' ? null : Number(normalized),
    );
    setEditing(null);
    setDraftFee('');
    setValidationMessage('');
  };

  return (
    <div className="rise-in">
      <section className="mb-7 max-w-3xl">
        <div className="mb-5 flex items-center gap-3">
          <span className="h-px w-8 bg-[hsl(var(--accent))]" />
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--accent))]">
            fee master / 16 patterns
          </span>
        </div>
        <h1 className="text-[clamp(2.2rem,5vw,4.8rem)] font-extrabold leading-none tracking-[-0.07em] text-[hsl(var(--primary))]">
          料金マスター
        </h1>
        <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-[hsl(var(--muted-foreground))]">
          固定4地域の出発・到着16パターンを管理します。セルを選択して金額を変更すると、判定画面にもすぐ反映されます。
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <section className="overflow-hidden rounded-[1.15rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card)/.88)] p-4 shadow-[0_12px_30px_hsl(220_34%_17%/.05)] sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
                Matrix / 4 × 4
              </p>
              <h2 className="mt-2 text-xl font-extrabold tracking-tight">出発地域 × 到着地域</h2>
            </div>
            <span className="rounded-full bg-[hsl(var(--secondary))] px-3 py-1.5 text-xs font-bold text-[hsl(var(--muted-foreground))]">
              クリックして編集
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-separate border-spacing-1.5 text-left">
              <thead>
                <tr>
                  <th className="w-[22%] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
                    出発＼到着
                  </th>
                  {REGIONS.map((region) => (
                    <th
                      key={region}
                      className={`rounded-lg px-3 py-3 text-center text-xs font-extrabold ${REGION_COLORS[region]}`}
                    >
                      {region}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REGIONS.map((departure) => (
                  <tr key={departure}>
                    <th className={`rounded-lg px-3 py-4 text-sm font-extrabold ${REGION_COLORS[departure]}`}>
                      {departure}
                    </th>
                    {REGIONS.map((arrival) => {
                      const fee = feeMatrix[departure][arrival];
                      return (
                        <td key={`${departure}-${arrival}`}>
                          <button
                            type="button"
                            onClick={() => openEditor(departure, arrival)}
                            className={`group flex min-h-[72px] w-full items-center justify-between gap-2 rounded-lg border px-3 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] hover:shadow-[0_8px_18px_hsl(var(--accent)/.12)] ${
                              fee === null
                                ? 'border-dashed border-[hsl(var(--border))] bg-[hsl(var(--background)/.5)]'
                                : 'border-[hsl(var(--card-border))] bg-[hsl(var(--card))]'
                            }`}
                          >
                            <span className={`text-sm font-extrabold ${fee === null ? 'text-[hsl(var(--muted-foreground))]' : 'text-[hsl(var(--foreground))]'}`}>
                              {formatFee(fee)}
                            </span>
                            <Pencil className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--muted-foreground))] opacity-0 transition-opacity group-hover:opacity-100" />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs font-medium text-[hsl(var(--muted-foreground))]">
            未設定のセルは空欄で保存できます。0円も有効な料金として登録できます。
          </p>
        </section>

        <section className="rounded-[1.15rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--primary))] p-5 text-[hsl(var(--primary-foreground))] shadow-[0_16px_40px_hsl(220_34%_17%/.13)] sm:p-6">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[hsl(var(--accent)/.16)] p-2 text-[hsl(var(--accent))]">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--primary-foreground)/.55)]">
                Change log
              </p>
              <h2 className="mt-1 text-lg font-extrabold">変更履歴</h2>
            </div>
          </div>
          {history.length > 0 ? (
            <div className="mt-6 space-y-4">
              {history.slice(0, 8).map((change) => (
                <div key={change.id} className="border-b border-[hsl(var(--primary-foreground)/.12)] pb-4 last:border-0">
                  <p className="text-xs font-bold">
                    {change.departure} → {change.arrival}
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-[hsl(var(--accent))]">
                    {formatFee(change.previousFee)} <span className="px-1 text-[hsl(var(--primary-foreground)/.45)]">→</span> {formatFee(change.nextFee)}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-[hsl(var(--primary-foreground)/.48)]">
                    {new Date(change.changedAt).toLocaleString('ja-JP')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-lg border border-dashed border-[hsl(var(--primary-foreground)/.18)] p-4 text-sm leading-6 text-[hsl(var(--primary-foreground)/.58)]">
              料金変更を保存すると、ここに履歴が残ります。
            </div>
          )}
        </section>
      </div>

      {editing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[hsl(220_34%_17%/.45)] p-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.15rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6 shadow-[0_24px_70px_hsl(220_34%_17%/.24)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--accent))]">
                  Edit fee
                </p>
                <h2 className="mt-2 text-xl font-extrabold">
                  {editing.departure} → {editing.arrival}
                </h2>
              </div>
              <button type="button" onClick={() => setEditing(null)} className="rounded-full p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="mt-7 block text-sm font-bold" htmlFor="fee-input">
              金額（円）
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 py-3 focus-within:border-[hsl(var(--accent))]">
              <input
                id="fee-input"
                type="number"
                min="0"
                step="1"
                value={draftFee}
                onChange={(event) => setDraftFee(event.target.value)}
                placeholder="未設定にする場合は空欄"
                className="min-w-0 flex-1 bg-transparent text-lg font-extrabold outline-none"
              />
              <span className="text-sm font-bold text-[hsl(var(--muted-foreground))]">円</span>
            </div>
            {validationMessage && <p className="mt-2 text-xs font-bold text-red-600">{validationMessage}</p>}
            <div className="mt-7 flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-[hsl(var(--border))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]">
                キャンセル
              </button>
              <button type="button" onClick={saveDraft} className="rounded-full bg-[hsl(var(--accent))] px-5 py-2.5 text-sm font-extrabold text-white shadow-[3px_3px_0_hsl(var(--primary))] hover:translate-y-0.5">
                保存する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function loadFeeMatrix(): FeeMatrix {
  try {
    const saved = window.localStorage.getItem('prefecture-fee-matrix');
    const parsed = saved ? (JSON.parse(saved) as Partial<FeeMatrix>) : {};

    return REGIONS.reduce(
      (matrix, departure) => ({
        ...matrix,
        [departure]: REGIONS.reduce(
          (row, arrival) => ({
            ...row,
            [arrival]:
              parsed[departure]?.[arrival] === null ||
              typeof parsed[departure]?.[arrival] === 'number'
                ? parsed[departure][arrival]
                : INITIAL_FEE_MATRIX[departure][arrival],
          }),
          {} as Record<Region, Fee>,
        ),
      }),
      {} as FeeMatrix,
    );
  } catch {
    return INITIAL_FEE_MATRIX;
  }
}

function Home() {
  const [view, setView] = useState<'calculator' | 'master'>('calculator');
  const [feeMatrix, setFeeMatrix] = useState<FeeMatrix>(loadFeeMatrix);
  const [feeHistory, setFeeHistory] = useState<FeeChange[]>(() => {
    try {
      const saved = window.localStorage.getItem('prefecture-fee-history');
      return saved ? (JSON.parse(saved) as FeeChange[]) : [];
    } catch {
      return [];
    }
  });
  const [departure, setDeparture] = useState<Prefecture | null>(null);
  const [arrival, setArrival] = useState<Prefecture | null>(null);
  const [departureQuery, setDepartureQuery] = useState('');
  const [arrivalQuery, setArrivalQuery] = useState('');

  useEffect(() => {
    window.localStorage.setItem('prefecture-fee-matrix', JSON.stringify(feeMatrix));
  }, [feeMatrix]);

  useEffect(() => {
    window.localStorage.setItem('prefecture-fee-history', JSON.stringify(feeHistory));
  }, [feeHistory]);

  const updateFee = (departureRegion: Region, arrivalRegion: Region, nextFee: Fee) => {
    const previousFee = feeMatrix[departureRegion][arrivalRegion];
    if (previousFee === nextFee) return;

    setFeeMatrix((current) => ({
      ...current,
      [departureRegion]: {
        ...current[departureRegion],
        [arrivalRegion]: nextFee,
      },
    }));
    setFeeHistory((current) => [
      {
        id: `${Date.now()}-${departureRegion}-${arrivalRegion}`,
        departure: departureRegion,
        arrival: arrivalRegion,
        previousFee,
        nextFee,
        changedAt: new Date().toISOString(),
      },
      ...current,
    ]);
  };

  const clearRoute = () => {
    setDeparture(null);
    setArrival(null);
    setDepartureQuery('');
    setArrivalQuery('');
  };

  return (
    <main className="app-shell paper-grid min-h-[100dvh] overflow-hidden">
      <header className="border-b border-[hsl(var(--border)/.75)] bg-[hsl(var(--background)/.84)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[0.65rem] bg-[hsl(var(--primary))] shadow-[3px_3px_0_hsl(var(--accent))]">
              <ArrowDown className="h-5 w-5 text-[hsl(var(--accent))]" />
            </div>
            <div>
              <p className="text-sm font-extrabold leading-tight tracking-tight">
                運賃確認デスク
              </p>
              <p className="font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">
                route desk / jp
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
            <span className="h-2 w-2 rounded-full bg-[hsl(163_43%_38%)] soft-pulse" />
            <span className="hidden sm:inline">料金マスタ稼働中</span>
            <button
              type="button"
              onClick={() => setView(view === 'calculator' ? 'master' : 'calculator')}
              className="ml-2 flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] px-3 py-2 text-xs font-bold transition-colors hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))]"
            >
              {view === 'calculator' ? (
                <>
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  料金マスター
                </>
              ) : (
                <>
                  <ArrowLeft className="h-3.5 w-3.5" />
                  判定画面へ
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 pb-12 pt-10 sm:px-8 sm:pt-14 lg:px-10 lg:pt-16">
        {view === 'master' ? (
          <FeeMasterPanel
            feeMatrix={feeMatrix}
            history={feeHistory}
            onUpdateFee={updateFee}
          />
        ) : (
          <>
        <section className="rise-in mb-10 max-w-3xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-8 bg-[hsl(var(--accent))]" />
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--accent))]">
              instant route check
            </span>
          </div>
          <h1 className="max-w-[780px] text-[clamp(2.5rem,6vw,5.25rem)] font-extrabold leading-[.98] tracking-[-0.075em] text-[hsl(var(--primary))]">
            <span className="text-[hsl(var(--accent))]">運賃</span>
          </h1>
        </section>

        <div className="grid items-stretch gap-5 lg:grid-cols-[1.08fr_.92fr] lg:gap-6">
          <section className="rise-in rise-in-delay-1 rounded-[1.15rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card)/.86)] p-5 shadow-[0_12px_30px_hsl(220_34%_17%/.05)] backdrop-blur-sm sm:p-8">
            <div className="mb-8 flex items-start justify-between gap-3">
              <div>
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
                  Input route / 02
                </span>
                <h2 className="mt-2 text-xl font-extrabold tracking-tight">ルートを指定</h2>
              </div>
              {(departure || arrival) && (
                <button
                  type="button"
                  data-testid="button-reset-route"
                  onClick={clearRoute}
                  className="group flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] px-3 py-2 text-xs font-bold text-[hsl(var(--muted-foreground))] transition-all hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))]"
                >
                  <Eraser className="h-3.5 w-3.5 transition-transform group-hover:-rotate-12" />
                  クリア
                </button>
              )}
            </div>

            <div className="space-y-5">
              <LocationField
                label="出発地"
                eyebrow="departure"
                value={departureQuery}
                selected={departure}
                onChange={(value) => {
                  setDepartureQuery(value);
                  if (departure?.name !== value) setDeparture(null);
                }}
                onSelect={(prefecture) => {
                  setDeparture(prefecture);
                  setDepartureQuery(prefecture.name);
                }}
              />
              <div className="flex items-center gap-3 pl-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--secondary))]">
                  <ArrowDown className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
                </div>
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">
                  destination
                </span>
                <div className="h-px flex-1 bg-[hsl(var(--border))]" />
              </div>
              <LocationField
                label="到着地"
                eyebrow="arrival"
                value={arrivalQuery}
                selected={arrival}
                onChange={(value) => {
                  setArrivalQuery(value);
                  if (arrival?.name !== value) setArrival(null);
                }}
                onSelect={(prefecture) => {
                  setArrival(prefecture);
                  setArrivalQuery(prefecture.name);
                }}
              />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[hsl(var(--border)/.8)] pt-5 text-xs font-medium text-[hsl(var(--muted-foreground))]">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
                候補をクリックして確定
              </span>
              <span className="hidden h-3 w-px bg-[hsl(var(--border))] sm:block" />
              <span>都道府県名・ひらがな対応</span>
            </div>
          </section>

          <div className="rise-in rise-in-delay-2">
            <ResultPanel departure={departure} arrival={arrival} feeMatrix={feeMatrix} />
          </div>
        </div>

        <section className="rise-in rise-in-delay-3 mt-7 grid gap-5 border-t border-[hsl(var(--border)/.8)] pt-6 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
                Master guide
              </span>
              <span className="h-1 w-1 rounded-full bg-[hsl(var(--accent))]" />
              <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                エリア区分
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(Object.keys(REGION_COLORS) as Region[]).map((region) => (
                <span
                  key={region}
                  data-testid={`legend-region-${region}`}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${REGION_COLORS[region]}`}
                >
                  {region}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 text-right">
            <div>
              <p className="text-xs font-bold text-[hsl(var(--foreground))]">
                登録43都道府県
              </p>
              <p className="mt-1 text-[11px] font-medium text-[hsl(var(--muted-foreground))]">
                料金設定なしの区間も表示
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/.7)]">
              <MapPin className="h-4 w-4 text-[hsl(var(--accent))]" />
            </div>
          </div>
        </section>
          </>
        )}
      </div>
    </main>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Home />
    </ErrorBoundary>
  );
}

export default App;