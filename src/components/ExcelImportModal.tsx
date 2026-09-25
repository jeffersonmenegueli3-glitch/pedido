import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  Truck,
  Wrench,
  FileCheck,
  RefreshCw,
  HelpCircle,
  Check,
  AlertTriangle
} from 'lucide-react';
import { VehicleStatus, MaintenancePriority, MaintenanceReason, MaintenanceStatus } from '../types/fleet';

interface ExcelImportModalProps {
  initialType?: 'vehicles' | 'maintenances';
  onClose: () => void;
  onImportVehiclesSuccess: () => void;
  onImportMaintenancesSuccess: () => void;
}

interface ParsedVehicleRow {
  rowNum: number;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  kmAtual: number;
  motorista: string;
  base: string;
  status: VehicleStatus;
  dataInicioParada?: string;
  observacoes: string;
  isValid: boolean;
  errorMessages: string[];
}

interface ParsedMaintenanceRow {
  rowNum: number;
  numeroOS?: string;
  placa: string;
  atividadePendente: string;
  motivo: MaintenanceReason;
  km: number;
  valor: number;
  prioridade: MaintenancePriority;
  motorista: string;
  base: string;
  status: MaintenanceStatus;
  dataAbertura: string;
  dataPlanejada: string;
  observacoes: string;
  isValid: boolean;
  errorMessages: string[];
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  initialType = 'vehicles',
  onClose,
  onImportVehiclesSuccess,
  onImportMaintenancesSuccess
}) => {
  const [importType, setImportType] = useState<'vehicles' | 'maintenances'>(initialType);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [parsedVehicles, setParsedVehicles] = useState<ParsedVehicleRow[]>([]);
  const [parsedMaintenances, setParsedMaintenances] = useState<ParsedMaintenanceRow[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to normalize keys from Excel headers
  const normalizeKey = (key: string): string => {
    return key
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  };

  // Download Vehicle Excel Template
  const handleDownloadVehicleTemplate = () => {
    const data = [
      {
        'Placa': 'ABC-1D23',
        'Modelo': 'FH 540 6x4',
        'Marca': 'Volvo',
        'Ano': 2023,
        'KM Atual': 145000,
        'Motorista': 'Carlos Eduardo',
        'Base': 'Rio',
        'Status': 'Disponível',
        'Data Início Parada': '',
        'Observações': 'Veículo revisado e em perfeito estado.'
      },
      {
        'Placa': 'DEF-4E56',
        'Modelo': 'Atego 2430 6x2',
        'Marca': 'Mercedes-Benz',
        'Ano': 2022,
        'KM Atual': 210000,
        'Motorista': 'Roberto Alves',
        'Base': 'Interior',
        'Status': 'Parado',
        'Data Início Parada': '2026-09-01',
        'Observações': 'Aguardando peças de reposição na caixa de cambio.'
      },
      {
        'Placa': 'GHI-7F89',
        'Modelo': 'Scania R450',
        'Marca': 'Scania',
        'Ano': 2024,
        'KM Atual': 85000,
        'Motorista': 'Marcos Vinicius',
        'Base': 'Redespacho',
        'Status': 'Em operação',
        'Data Início Parada': '',
        'Observações': 'Operação rota Rio x São Paulo.'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cadastro_Frota');

    // Auto-fit column widths
    worksheet['!cols'] = [
      { wch: 12 }, { wch: 20 }, { wch: 16 }, { wch: 8 },
      { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
      { wch: 20 }, { wch: 35 }
    ];

    XLSX.writeFile(workbook, 'Modelo_Cadastro_Frota_Excel.xlsx');
  };

  // Download Maintenance Excel Template
  const handleDownloadMaintenanceTemplate = () => {
    const data = [
      {
        'Número OS': 'OS-2026-101',
        'Placa': 'ABC-1D23',
        'Atividade Pendente': 'Troca de Óleo e Filtro de Ar',
        'Motivo': 'Preventiva',
        'KM': 145000,
        'Valor (R$)': 1250,
        'Prioridade': 'Média',
        'Motorista': 'Carlos Eduardo',
        'Base': 'Rio',
        'Status': 'Aberta',
        'Data Abertura': '2026-09-20',
        'Data Planejada': '2026-09-25',
        'Observações': 'Manutenção preventiva programada de 150k km.'
      },
      {
        'Número OS': 'OS-2026-102',
        'Placa': 'DEF-4E56',
        'Atividade Pendente': 'Substituição Amortecedores Dianteiros',
        'Motivo': 'Desgaste',
        'KM': 210000,
        'Valor (R$)': 3400,
        'Prioridade': 'Alta',
        'Motorista': 'Roberto Alves',
        'Base': 'Interior',
        'Status': 'Em andamento',
        'Data Abertura': '2026-09-15',
        'Data Planejada': '2026-09-22',
        'Observações': 'Troca em oficina credenciada.'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ordens_Manutencao');

    worksheet['!cols'] = [
      { wch: 14 }, { wch: 12 }, { wch: 32 }, { wch: 14 },
      { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 20 },
      { wch: 15 }, { wch: 15 }, { wch: 14 }, { wch: 14 }, { wch: 35 }
    ];

    XLSX.writeFile(workbook, 'Modelo_Ordens_Manutencao_Excel.xlsx');
  };

  // Process File Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      parseExcelFile(selectedFile);
    }
  };

  const parseExcelFile = async (fileToParse: File) => {
    setFile(fileToParse);
    setIsProcessing(true);
    setUploadError(null);

    try {
      const arrayBuffer = await fileToParse.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (rawRows.length === 0) {
        setUploadError('A planilha selecionada está vazia ou não contém dados válidos.');
        setIsProcessing(false);
        return;
      }

      if (importType === 'vehicles') {
        processVehicleRows(rawRows);
      } else {
        processMaintenanceRows(rawRows);
      }
    } catch (err: any) {
      console.error('Excel parse error:', err);
      setUploadError('Erro ao ler o arquivo Excel. Verifique se o formato é .xlsx, .xls ou .csv.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Process Vehicles
  const processVehicleRows = (rows: any[]) => {
    const parsed: ParsedVehicleRow[] = rows.map((row, index) => {
      const errorMessages: string[] = [];
      const rowNum = index + 2; // header is row 1

      // Find fields with flexible key matching
      let placa = '';
      let modelo = '';
      let marca = '';
      let ano = new Date().getFullYear();
      let kmAtual = 0;
      let motorista = '';
      let base = 'Rio';
      let status: VehicleStatus = 'Disponível';
      let dataInicioParada = '';
      let observacoes = '';

      Object.keys(row).forEach((key) => {
        const norm = normalizeKey(key);
        const val = String(row[key]).trim();

        if (norm.includes('placa')) placa = val.toUpperCase().replace(/\s+/g, '');
        else if (norm.includes('modelo')) modelo = val;
        else if (norm.includes('marca')) marca = val;
        else if (norm.includes('ano')) ano = parseInt(val, 10) || ano;
        else if (norm.includes('km') || norm.includes('quilometragem')) kmAtual = parseFloat(val) || 0;
        else if (norm.includes('motorista') || norm.includes('responsavel')) motorista = val;
        else if (norm.includes('base') || norm.includes('operacao') || norm.includes('filial')) base = val;
        else if (norm.includes('status')) {
          const lowerVal = val.toLowerCase();
          if (lowerVal.includes('disp')) status = 'Disponível';
          else if (lowerVal.includes('oper')) status = 'Em operação';
          else if (lowerVal.includes('parad')) status = 'Parado';
          else if (lowerVal.includes('manut')) status = 'Em manutenção';
          else if (lowerVal.includes('inat')) status = 'Inativo';
        } else if (norm.includes('inicioparada') || norm.includes('dataparada') || norm.includes('parado')) {
          dataInicioParada = val;
        } else if (norm.includes('obs') || norm.includes('nota') || norm.includes('descricao')) {
          observacoes = val;
        }
      });

      // Validation
      if (!placa) {
        errorMessages.push('Placa é obrigatória');
      } else if (placa.length < 5) {
        errorMessages.push('Placa inválida');
      }

      if (!modelo) {
        modelo = 'Modelo Não Especificado';
      }

      if (!marca) {
        marca = 'Não especificada';
      }

      if (!base) {
        base = 'Rio';
      }

      return {
        rowNum,
        placa,
        modelo,
        marca,
        ano: isNaN(ano) ? new Date().getFullYear() : ano,
        kmAtual: isNaN(kmAtual) ? 0 : kmAtual,
        motorista: motorista || 'Motorista Não Atribuído',
        base,
        status,
        dataInicioParada: dataInicioParada || undefined,
        observacoes,
        isValid: errorMessages.length === 0,
        errorMessages
      };
    });

    setParsedVehicles(parsed);
  };

  // Process Maintenances
  const processMaintenanceRows = (rows: any[]) => {
    const today = new Date().toISOString().split('T')[0];

    const parsed: ParsedMaintenanceRow[] = rows.map((row, index) => {
      const errorMessages: string[] = [];
      const rowNum = index + 2;

      let numeroOS = '';
      let placa = '';
      let atividadePendente = '';
      let motivo: MaintenanceReason = 'Preventiva';
      let km = 100000;
      let valor = 0;
      let prioridade: MaintenancePriority = 'Média';
      let motorista = '';
      let base = 'Rio';
      let status: MaintenanceStatus = 'Aberta';
      let dataAbertura = today;
      let dataPlanejada = today;
      let observacoes = '';

      Object.keys(row).forEach((key) => {
        const norm = normalizeKey(key);
        const val = String(row[key]).trim();

        if (norm.includes('numeroos') || norm.includes('os') || norm.includes('codigo')) numeroOS = val;
        else if (norm.includes('placa')) placa = val.toUpperCase().replace(/\s+/g, '');
        else if (norm.includes('atividade') || norm.includes('servico') || norm.includes('pendente') || norm.includes('descricao')) atividadePendente = val;
        else if (norm.includes('motivo')) {
          const lowerVal = val.toLowerCase();
          if (lowerVal.includes('desg')) motivo = 'Desgaste';
          else if (lowerVal.includes('prev')) motivo = 'Preventiva';
          else if (lowerVal.includes('corr')) motivo = 'Corretiva';
        } else if (norm.includes('km') || norm.includes('quilometragem')) km = parseFloat(val) || 100000;
        else if (norm.includes('valor') || norm.includes('custo') || norm.includes('preco')) valor = parseFloat(val.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
        else if (norm.includes('prio')) {
          const lowerVal = val.toLowerCase();
          if (lowerVal.includes('baix')) prioridade = 'Baixa';
          else if (lowerVal.includes('alt')) prioridade = 'Alta';
          else if (lowerVal.includes('urg')) prioridade = 'Urgente';
          else prioridade = 'Média';
        } else if (norm.includes('motorista') || norm.includes('solicitante')) motorista = val;
        else if (norm.includes('base') || norm.includes('operacao')) base = val;
        else if (norm.includes('status')) {
          const lowerVal = val.toLowerCase();
          if (lowerVal.includes('andam')) status = 'Em andamento';
          else if (lowerVal.includes('concl')) status = 'Concluída';
          else if (lowerVal.includes('atras')) status = 'Atrasada';
          else status = 'Aberta';
        } else if (norm.includes('abertura') || norm.includes('dataabertura')) dataAbertura = val;
        else if (norm.includes('planej') || norm.includes('previsao')) dataPlanejada = val;
        else if (norm.includes('obs') || norm.includes('nota')) observacoes = val;
      });

      if (!placa) {
        errorMessages.push('Placa é obrigatória');
      }

      if (!atividadePendente) {
        atividadePendente = 'Manutenção / Reparo Preventivo';
      }

      return {
        rowNum,
        numeroOS: numeroOS || undefined,
        placa,
        atividadePendente,
        motivo,
        km,
        valor,
        prioridade,
        motorista: motorista || 'Solicitante Não Atribuído',
        base: base || 'Rio',
        status,
        dataAbertura: dataAbertura || today,
        dataPlanejada: dataPlanejada || today,
        observacoes,
        isValid: errorMessages.length === 0,
        errorMessages
      };
    });

    setParsedMaintenances(parsed);
  };

  // Submit Vehicle Bulk Import to Backend
  const handleSubmitVehicles = async () => {
    const validVehicles = parsedVehicles.filter(v => v.isValid);
    if (validVehicles.length === 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/vehicles/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicles: validVehicles })
      });

      if (res.ok) {
        onImportVehiclesSuccess();
        onClose();
      } else {
        const errData = await res.json();
        setUploadError(errData.error || 'Erro ao realizar cadastro em massa no servidor.');
      }
    } catch (err: any) {
      console.error('Submit vehicles error:', err);
      setUploadError('Falha de conexão ao enviar dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Maintenances Bulk Import to Backend
  const handleSubmitMaintenances = async () => {
    const validOrders = parsedMaintenances.filter(m => m.isValid);
    if (validOrders.length === 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/maintenances/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: validOrders })
      });

      if (res.ok) {
        onImportMaintenancesSuccess();
        onClose();
      } else {
        const errData = await res.json();
        setUploadError(errData.error || 'Erro ao cadastrar ordens de manutenção.');
      }
    } catch (err: any) {
      console.error('Submit maintenances error:', err);
      setUploadError('Falha de conexão ao enviar dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validVehiclesCount = parsedVehicles.filter(v => v.isValid).length;
  const validMaintenancesCount = parsedMaintenances.filter(m => m.isValid).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl relative my-8">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide">
                Cadastro em Massa via Planilha Excel
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Importe veículos da frota ou ordens de manutenção diretamente de um arquivo Excel (.xlsx, .xls) ou CSV.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-950 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setImportType('vehicles');
              setFile(null);
              setParsedVehicles([]);
              setParsedMaintenances([]);
              setUploadError(null);
            }}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              importType === 'vehicles'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Cadastrar Veículos na Frota</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setImportType('maintenances');
              setFile(null);
              setParsedVehicles([]);
              setParsedMaintenances([]);
              setUploadError(null);
            }}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              importType === 'maintenances'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Cadastrar Ordens de Manutenção (OS)</span>
          </button>
        </div>

        {/* Step 1: Download Template */}
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">
                Ainda não possui a planilha formatada?
              </h4>
              <p className="text-[11px] text-slate-400">
                Baixe o modelo com cabeçalhos padrão e exemplos preenchidos para evitar erros.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              importType === 'vehicles'
                ? handleDownloadVehicleTemplate
                : handleDownloadMaintenanceTemplate
            }
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap active:scale-95 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Modelo Excel (.xlsx)</span>
          </button>
        </div>

        {/* Upload Zone */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-300">
            Selecione ou Arraste a Planilha Excel:
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-950/80 hover:bg-slate-950 p-6 rounded-2xl text-center cursor-pointer transition group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <UploadCloud className="w-10 h-10 text-slate-500 group-hover:text-emerald-400 mx-auto mb-2 transition" />
            {file ? (
              <div>
                <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                  <FileCheck className="w-4 h-4" /> Arquivo carregado: {file.name}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Clique aqui se quiser escolher outro arquivo.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-slate-200">
                  Clique aqui para selecionar o arquivo Excel
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Suporta arquivos .XLSX, .XLS e .CSV
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Error Banner */}
        {uploadError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {isProcessing && (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400" />
            <p className="text-xs font-bold text-slate-200">Lendo e validando dados da planilha Excel...</p>
          </div>
        )}

        {/* Data Preview Table - Vehicles */}
        {!isProcessing && importType === 'vehicles' && parsedVehicles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-2">
                <span>Pré-visualização do Cadastro ({parsedVehicles.length} registros)</span>
              </span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  🟢 {validVehiclesCount} Válidos
                </span>
                {parsedVehicles.length - validVehiclesCount > 0 && (
                  <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                    🔴 {parsedVehicles.length - validVehiclesCount} Incompletos
                  </span>
                )}
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-2xl bg-slate-950">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 font-bold text-[11px]">
                  <tr>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5">Linha</th>
                    <th className="p-2.5">Placa</th>
                    <th className="p-2.5">Modelo</th>
                    <th className="p-2.5">Marca</th>
                    <th className="p-2.5">Ano</th>
                    <th className="p-2.5">KM</th>
                    <th className="p-2.5">Motorista</th>
                    <th className="p-2.5">Base</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {parsedVehicles.map((row) => (
                    <tr
                      key={row.rowNum}
                      className={row.isValid ? 'hover:bg-slate-900/60' : 'bg-rose-950/20 text-rose-200'}
                    >
                      <td className="p-2.5 text-center">
                        {row.isValid ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <span title={row.errorMessages.join(', ')}>
                            <AlertTriangle className="w-4 h-4 text-rose-400 mx-auto" />
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-slate-400">#{row.rowNum}</td>
                      <td className="p-2.5 font-bold text-indigo-300">{row.placa || '-'}</td>
                      <td className="p-2.5 text-slate-200 font-sans">{row.modelo}</td>
                      <td className="p-2.5 text-slate-300 font-sans">{row.marca}</td>
                      <td className="p-2.5 text-slate-300">{row.ano}</td>
                      <td className="p-2.5 text-slate-300">{row.kmAtual.toLocaleString('pt-BR')} km</td>
                      <td className="p-2.5 text-slate-300 font-sans">{row.motorista}</td>
                      <td className="p-2.5 text-slate-300 font-sans">{row.base}</td>
                      <td className="p-2.5 font-sans">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 border border-slate-700 text-slate-300">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Data Preview Table - Maintenances */}
        {!isProcessing && importType === 'maintenances' && parsedMaintenances.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-2">
                <span>Pré-visualização das Ordens OS ({parsedMaintenances.length} registros)</span>
              </span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  🟢 {validMaintenancesCount} Válidos
                </span>
                {parsedMaintenances.length - validMaintenancesCount > 0 && (
                  <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                    🔴 {parsedMaintenances.length - validMaintenancesCount} Incompletos
                  </span>
                )}
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-2xl bg-slate-950">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 font-bold text-[11px]">
                  <tr>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5">Linha</th>
                    <th className="p-2.5">Nº OS</th>
                    <th className="p-2.5">Placa</th>
                    <th className="p-2.5">Atividade</th>
                    <th className="p-2.5">Motivo</th>
                    <th className="p-2.5">Valor</th>
                    <th className="p-2.5">Prioridade</th>
                    <th className="p-2.5">Base</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {parsedMaintenances.map((row) => (
                    <tr
                      key={row.rowNum}
                      className={row.isValid ? 'hover:bg-slate-900/60' : 'bg-rose-950/20 text-rose-200'}
                    >
                      <td className="p-2.5 text-center">
                        {row.isValid ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <span title={row.errorMessages.join(', ')}>
                            <AlertTriangle className="w-4 h-4 text-rose-400 mx-auto" />
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-slate-400">#{row.rowNum}</td>
                      <td className="p-2.5 text-amber-300">{row.numeroOS || 'Auto'}</td>
                      <td className="p-2.5 font-bold text-indigo-300">{row.placa || '-'}</td>
                      <td className="p-2.5 text-slate-200 font-sans">{row.atividadePendente}</td>
                      <td className="p-2.5 text-slate-300 font-sans">{row.motivo}</td>
                      <td className="p-2.5 text-emerald-300">R$ {row.valor.toLocaleString('pt-BR')}</td>
                      <td className="p-2.5 text-slate-300 font-sans">{row.prioridade}</td>
                      <td className="p-2.5 text-slate-300 font-sans">{row.base}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition"
          >
            Cancelar
          </button>

          {importType === 'vehicles' ? (
            <button
              type="button"
              disabled={validVehiclesCount === 0 || isSubmitting}
              onClick={handleSubmitVehicles}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition active:scale-95 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Cadastrando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cadastrar {validVehiclesCount} Veículo(s) na Frota</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled={validMaintenancesCount === 0 || isSubmitting}
              onClick={handleSubmitMaintenances}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition active:scale-95 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Cadastrando OS...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cadastrar {validMaintenancesCount} Ordem(ns) OS</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
