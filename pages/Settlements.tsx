
import React, { useState, useMemo, useEffect } from 'react';
import type { Order, Settlement, Client, MonthlyDocument, SettlementItem } from '../types';
import { OrderStatus, OrderItemType } from '../types';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import PlusIcon from '../components/icons/PlusIcon';
import EditIcon from '../components/icons/EditIcon';
import TrashIcon from '../components/icons/TrashIcon';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import EyeIcon from '../components/icons/EyeIcon';
import DownloadIcon from '../components/icons/DownloadIcon';

// TypeScript declaration for the pdf-lib library loaded from CDN
declare global {
    interface Window {
        PDFLib: any;
    }
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const dataUriToBlob = async (dataUri: string): Promise<Blob | null> => {
    if (!dataUri) return null;
    try {
        const response = await fetch(dataUri);
        if (!response.ok) {
            console.error('Failed to fetch data URI:', response.statusText);
            return null;
        }
        return await response.blob();
    } catch (error) {
        console.error('Error converting data URI to Blob:', error);
        return null;
    }
};

const MonthlyDocumentsManager: React.FC<{
    year: number;
    month: number;
    monthlyDocument: MonthlyDocument | undefined;
    addOrUpdateMonthlyDocument: (doc: MonthlyDocument) => void;
}> = ({ year, month, monthlyDocument, addOrUpdateMonthlyDocument }) => {
    const [pozFile, setPozFile] = useState<{ name: string; } | null>(null);
    const [invoiceFile, setInvoiceFile] = useState<{ name: string; } | null>(null);
    const [pozFileContent, setPozFileContent] = useState<string | null>(null);
    const [invoiceFileContent, setInvoiceFileContent] = useState<string | null>(null);
    const [isMerging, setIsMerging] = useState(false);
    
    useEffect(() => {
        setPozFile(monthlyDocument?.pozPdf ? { name: 'POZ.pdf' } : null);
        setInvoiceFile(monthlyDocument?.invoicePdf ? { name: 'Faktura.pdf' } : null);
        setPozFileContent(monthlyDocument?.pozPdf || null);
        setInvoiceFileContent(monthlyDocument?.invoicePdf || null);
    }, [monthlyDocument]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'poz' | 'invoice') => {
        const file = e.target.files?.[0];
        const MAX_FILE_SIZE_MB = 1.5;
        const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

        if (file) {
            if (file.type !== 'application/pdf') {
                alert('Proszę wybrać plik PDF.');
                e.target.value = '';
                return;
            }
            if (file.size > MAX_FILE_SIZE_BYTES) {
                alert(`Plik jest za duży. Maksymalny rozmiar to ${MAX_FILE_SIZE_MB} MB.`);
                e.target.value = '';
                return;
            }

            const base64 = await fileToBase64(file);
            if (type === 'poz') {
                setPozFile({ name: file.name });
                setPozFileContent(base64);
                addOrUpdateMonthlyDocument({
                    ...(monthlyDocument || { id: `${year}-${month.toString().padStart(2, '0')}`, year, month }),
                    pozPdf: base64,
                });
            } else {
                setInvoiceFile({ name: file.name });
                setInvoiceFileContent(base64);
                addOrUpdateMonthlyDocument({
                     ...(monthlyDocument || { id: `${year}-${month.toString().padStart(2, '0')}`, year, month }),
                    invoicePdf: base64,
                });
            }
        }
    };

    const performMerge = async (): Promise<string | null> => {
        if (!pozFileContent || !invoiceFileContent) return null;
        if (!window.PDFLib) {
            alert("Biblioteka PDF nie została załadowana. Sprawdź połączenie internetowe i spróbuj ponownie.");
            return null;
        }
        
        setIsMerging(true);
        try {
            const { PDFDocument } = window.PDFLib;
            
            const [pozResponse, invoiceResponse] = await Promise.all([
                fetch(pozFileContent),
                fetch(invoiceFileContent)
            ]);
            
            if (!pozResponse.ok || !invoiceResponse.ok) {
                alert("Błąd: Nie udało się wczytać jednego z plików PDF.");
                console.error('Failed to fetch data URIs', pozResponse.statusText, invoiceResponse.statusText);
                return null;
            }

            const [pozBytes, invoiceBytes] = await Promise.all([
                pozResponse.arrayBuffer(),
                invoiceResponse.arrayBuffer()
            ]);
            
            const mergedPdfDoc = await PDFDocument.create();

            const pozDoc = await PDFDocument.load(pozBytes);
            const invoiceDoc = await PDFDocument.load(invoiceBytes);

            const pozPages = await mergedPdfDoc.copyPages(pozDoc, pozDoc.getPageIndices());
            pozPages.forEach(page => mergedPdfDoc.addPage(page));

            const invoicePages = await mergedPdfDoc.copyPages(invoiceDoc, invoiceDoc.getPageIndices());
            invoicePages.forEach(page => mergedPdfDoc.addPage(page));

            return await mergedPdfDoc.saveAsBase64({ dataUri: true });

        } catch (error) {
            console.error("Błąd podczas łączenia plików PDF:", error);
            alert("Wystąpił błąd podczas łączenia plików PDF.");
            return null;
        } finally {
            setIsMerging(false);
        }
    };
    
    const handlePreview = async () => {
        const mergedPdfDataUri = await performMerge();
        if (mergedPdfDataUri) {
            const blob = await dataUriToBlob(mergedPdfDataUri);
            if (blob && blob.size > 0) {
                const url = URL.createObjectURL(blob);
                const newWindow = window.open(url, '_blank');
                if (!newWindow) {
                    alert('Proszę wyłączyć blokowanie wyskakujących okienek, aby zobaczyć podgląd.');
                }
            } else {
                alert("Nie można wygenerować podglądu, plik wynikowy jest pusty.")
            }
        }
    };
    
    const handleDownload = async () => {
        const mergedPdfDataUri = await performMerge();
        if (mergedPdfDataUri) {
            const blob = await dataUriToBlob(mergedPdfDataUri);
            if (blob && blob.size > 0) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Rozliczenie-${year}-${month.toString().padStart(2, '0')}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                 alert("Nie można pobrać pliku, plik wynikowy jest pusty.")
            }
        }
    };
    
    const handleReset = () => {
        setPozFile(null);
        setPozFileContent(null);
        setInvoiceFile(null);
        setInvoiceFileContent(null);
        addOrUpdateMonthlyDocument({
            id: `${year}-${month.toString().padStart(2, '0')}`,
            year,
            month,
            pozPdf: undefined,
            invoicePdf: undefined,
        });
    };

    return (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-md mb-2">Dokumenty Miesięczne</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">POZ (.pdf)</label>
                    {pozFileContent ? (
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-green-600 truncate flex-1">Załadowano: {pozFile?.name || 'POZ.pdf'}</p>
                        </div>
                    ) : (
                        <Input type="file" accept=".pdf" onChange={e => handleFileChange(e, 'poz')} disabled={isMerging} />
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Faktura (.pdf)</label>
                    {invoiceFileContent ? (
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-green-600 truncate flex-1">Załadowano: {invoiceFile?.name || 'Faktura.pdf'}</p>
                        </div>
                    ) : (
                        <Input type="file" accept=".pdf" onChange={e => handleFileChange(e, 'invoice')} disabled={isMerging} />
                    )}
                </div>
            </div>
            <div className="mt-4 flex items-center gap-2 flex-wrap">
                {pozFileContent && invoiceFileContent ? (
                    <>
                        <Button onClick={handlePreview} disabled={isMerging}>
                            {isMerging ? 'Przetwarzanie...' : <><EyeIcon className="w-5 h-5 mr-2" /> Podgląd</>}
                        </Button>
                        <Button onClick={handleDownload} disabled={isMerging}>
                            {isMerging ? 'Przetwarzanie...' : <><DownloadIcon className="w-5 h-5 mr-2" /> Pobierz</>}
                        </Button>
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground">Wgraj oba pliki, aby je połączyć.</p>
                )}
                {(pozFileContent || invoiceFileContent) && (
                     <Button variant="destructive" onClick={handleReset} disabled={isMerging}>
                         Wyczyść pliki
                     </Button>
                )}
            </div>
        </div>
    );
};

interface SettlementsProps {
  settlements: Settlement[];
  orders: Order[];
  clients: Client[];
  monthlyDocuments: MonthlyDocument[];
  addSettlement: (settlement: Omit<Settlement, 'id'>) => void;
  updateSettlement: (settlement: Settlement) => void;
  deleteSettlement: (settlementId: string) => void;
  addOrUpdateMonthlyDocument: (doc: MonthlyDocument) => void;
}

const initialSettlementState: Omit<Settlement, 'id'> = {
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  date: new Date().toISOString().split('T')[0],
  items: [{ id: crypto.randomUUID(), orderId: '', itemType: OrderItemType.CONSULTATIONS, hours: 0, rate: 0 }],
};

const Settlements: React.FC<SettlementsProps> = ({ settlements, orders, clients, monthlyDocuments, addSettlement, updateSettlement, deleteSettlement, addOrUpdateMonthlyDocument }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingSettlement, setEditingSettlement] = useState<Settlement | null>(null);
  const [settlementData, setSettlementData] = useState<Omit<Settlement, 'id'>>(initialSettlementState);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [settlementToDelete, setSettlementToDelete] = useState<string | null>(null);

  const activeOrders = useMemo(() => orders.filter(o => o.status === OrderStatus.ACTIVE), [orders]);
  
  const sortedSettlements = useMemo(() =>
    [...settlements].sort((a, b) => (b.year * 100 + b.month) - (a.year * 100 + a.month)),
    [settlements]
  );

  useEffect(() => {
    if (editingSettlement) {
        const { id, ...dataToEdit } = editingSettlement;
        setSettlementData(dataToEdit);
        setShowForm(true);
    }
  }, [editingSettlement]);

  const handleCancel = () => {
    setShowForm(false);
    setEditingSettlement(null);
    setSettlementData(initialSettlementState);
  };
  
  const handleAddNew = () => {
    setEditingSettlement(null);
    setSettlementData(initialSettlementState);
    setShowForm(true);
  };
  
  const handleEdit = (settlement: Settlement) => {
    setEditingSettlement(settlement);
  };
  
  const handleDeleteClick = (settlementId: string) => {
      setSettlementToDelete(settlementId);
      setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
      if (settlementToDelete) {
          deleteSettlement(settlementToDelete);
      }
      setIsConfirmOpen(false);
      setSettlementToDelete(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettlementData(prev => ({ ...prev, [name]: ['year', 'month'].includes(name) ? Number(value) : value }));
  };
  
  const handleItemChange = (index: number, field: keyof SettlementItem, value: string | number) => {
    const updatedItems = [...settlementData.items];
    let currentItem = { ...updatedItems[index] };

    const findRate = (orderId: string, itemType: OrderItemType): number => {
        const order = activeOrders.find(o => o.id === orderId);
        const orderItem = order?.items.find(i => i.type === itemType);
        return orderItem?.rate || 0;
    };

    if (field === 'orderId') {
        currentItem.orderId = value as string;
        const order = activeOrders.find(o => o.id === value);
        const availableTypes = order?.items.map(i => i.type) || [];
        if (availableTypes.length > 0) {
            currentItem.itemType = availableTypes[0];
            currentItem.rate = findRate(currentItem.orderId, currentItem.itemType);
        } else {
            currentItem.itemType = OrderItemType.CONSULTATIONS;
            currentItem.rate = 0;
        }
    } else if (field === 'itemType') {
        currentItem.itemType = value as OrderItemType;
        currentItem.rate = findRate(currentItem.orderId, currentItem.itemType);
    } else if (field === 'hours') {
        currentItem.hours = Number(value);
    } else if (field === 'rate') {
        currentItem.rate = Number(value);
    }
    
    updatedItems[index] = currentItem;
    setSettlementData(prev => ({...prev, items: updatedItems }));
  };

  const addItem = () => {
      setSettlementData(prev => ({
          ...prev,
          items: [...prev.items, { id: crypto.randomUUID(), orderId: '', itemType: OrderItemType.CONSULTATIONS, hours: 0, rate: 0 }]
      }));
  };

  const removeItem = (index: number) => {
      setSettlementData(prev => ({
          ...prev,
          items: prev.items.filter((_, i) => i !== index)
      }));
  };

  const handleCopyFromSettlement = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    if (!templateId) {
        return;
    }

    const templateSettlement = settlements.find(s => s.id === templateId);
    if (templateSettlement) {
        const copiedItems = templateSettlement.items
            .filter(item => activeOrders.some(order => order.id === item.orderId))
            .map(item => ({
                id: crypto.randomUUID(),
                orderId: item.orderId,
                itemType: item.itemType,
                hours: 0, // Reset hours
                rate: item.rate, // Keep the rate
            }));
        
        if (copiedItems.length > 0) {
            setSettlementData(prev => ({
                ...prev,
                items: copiedItems,
            }));
        } else {
            alert("Nie można skopiować pozycji, ponieważ powiązane zamówienia nie są już aktywne.");
        }
    }
    e.target.value = ""; // Reset select after action
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = settlementData.items.filter(item => item.orderId && item.hours > 0);
    
    if (validItems.length === 0) {
        alert("Proszę dodać przynajmniej jedną pozycję z wybranym zamówieniem i liczbą godzin większą od 0.");
        return;
    }

    const dataToSave = { ...settlementData, items: validItems };

    if (editingSettlement) {
        updateSettlement({ ...dataToSave, id: editingSettlement.id });
    } else {
        // Check if settlement for this month/year already exists
        const existing = settlements.find(s => s.year === settlementData.year && s.month === settlementData.month);
        if (existing) {
            alert(`Rozliczenie za ${settlementData.month}/${settlementData.year} już istnieje. Możesz je edytować.`);
            return;
        }
        addSettlement(dataToSave);
    }
    handleCancel();
  };
  
  const getOrderInfo = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { orderNumber: 'N/A', clientName: 'N/A', clientId: '' };
    const client = clients.find(c => c.id === order.clientId);
    return {
        orderNumber: order.orderNumber,
        clientName: client?.name || 'N/A',
        clientId: client?.id || '',
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary dark:text-white">Rozliczenia</h1>
        <Button onClick={showForm && !editingSettlement ? handleCancel : handleAddNew}>
            <PlusIcon className="w-4 h-4 mr-2" />
            {showForm && !editingSettlement ? 'Anuluj' : 'Dodaj Rozliczenie'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingSettlement ? `Edytuj Rozliczenie - ${editingSettlement.month}/${editingSettlement.year}` : 'Nowe Rozliczenie'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                 <Input label="Rok" name="year" type="number" value={settlementData.year} onChange={handleInputChange} required disabled={!!editingSettlement}/>
                 <Input label="Miesiąc" name="month" type="number" value={settlementData.month} min="1" max="12" onChange={handleInputChange} required disabled={!!editingSettlement}/>
                 <Input label="Data dokumentu" name="date" type="date" value={settlementData.date} onChange={handleInputChange} required />
              </div>

              {!editingSettlement && (
                  <div className="pt-2 pb-4 border-b">
                      <Select
                          label="Kopiuj pozycje z (opcjonalnie)"
                          onChange={handleCopyFromSettlement}
                          defaultValue=""
                      >
                          <option value="">Wybierz szablon rozliczenia...</option>
                          {sortedSettlements.map(s => (
                              <option key={s.id} value={s.id}>
                                  {`${s.month.toString().padStart(2, '0')}/${s.year}`}
                              </option>
                          ))}
                      </Select>
                  </div>
              )}
              
              <h4 className="font-medium">Pozycje rozliczenia</h4>
              <div className="space-y-2">
                 {settlementData.items.map((item, index) => {
                     const selectedOrder = activeOrders.find(o => o.id === item.orderId);
                     const availableItemTypes = selectedOrder?.items.map(i => i.type) || [];
                     return (
                      <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start p-2 border rounded-md">
                          <div className="md:col-span-4">
                              <Select label="Zamówienie" value={item.orderId} onChange={e => handleItemChange(index, 'orderId', e.target.value)} required>
                                  <option value="">Wybierz zamówienie</option>
                                  {activeOrders.map(o => <option key={o.id} value={o.id}>{o.orderNumber} ({clients.find(c=>c.id===o.clientId)?.name})</option>)}
                              </Select>
                          </div>
                          <div className="md:col-span-3">
                              <Select label="Typ Pracy" value={item.itemType} onChange={e => handleItemChange(index, 'itemType', e.target.value)} disabled={!item.orderId} required>
                                  {availableItemTypes.map(type => <option key={type} value={type}>{type}</option>)}
                              </Select>
                                {item.orderId && item.itemType && (() => {
                                    const orderItemDetails = selectedOrder?.items.find(i => i.type === item.itemType);
                                    const limitHours = orderItemDetails?.hours ?? 0;

                                    const usedHoursInDB = settlements
                                        .filter(s => editingSettlement ? s.id !== editingSettlement.id : true)
                                        .flatMap(s => s.items)
                                        .filter(i => i.orderId === item.orderId && i.itemType === item.itemType)
                                        .reduce((sum, i) => sum + i.hours, 0);

                                    const usedHoursInOtherFormItems = settlementData.items
                                        .filter((it, idx) => idx !== index && it.orderId === item.orderId && it.itemType === item.itemType)
                                        .reduce((sum, it) => sum + Number(it.hours), 0);
                                    
                                    const availableForThisItem = limitHours - usedHoursInDB - usedHoursInOtherFormItems;

                                    return (
                                        <div className="mt-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-md text-sm text-blue-700 dark:text-blue-300">
                                            Dostępne: <span className="font-bold">{availableForThisItem.toFixed(2)}</span> / {limitHours.toFixed(2)} godz.
                                        </div>
                                    );
                                })()}
                          </div>
                          <div className="md:col-span-2">
                             <Input label="Godziny" type="number" step="0.5" value={item.hours} onChange={e => handleItemChange(index, 'hours', e.target.value)} required />
                          </div>
                           <div className="md:col-span-2">
                             <Input label="Stawka" type="number" step="0.01" value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} required />
                          </div>
                          <div className="md:col-span-1 flex items-end">
                            <Button variant="destructive" type="button" className="w-full" onClick={() => removeItem(index)} disabled={settlementData.items.length <= 1}>
                                <TrashIcon />
                            </Button>
                          </div>
                      </div>
                     )
                 })}
                 <Button type="button" variant="secondary" onClick={addItem}>
                    <PlusIcon className="w-4 h-4 mr-2"/> Dodaj Pozycję
                  </Button>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" type="button" onClick={handleCancel}>Anuluj</Button>
                <Button type="submit">{editingSettlement ? 'Zapisz Zmiany' : 'Zapisz Rozliczenie'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle>Historia Rozliczeń</CardTitle>
            <CardDescription>Przeglądaj historyczne zapisy pracy oraz zarządzaj dokumentami.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-8">
                {[...settlements].sort((a,b) => (b.year * 100 + b.month) - (a.year * 100 + a.month)).map(settlement => {
                    const monthlyDocument = monthlyDocuments.find(d => d.year === settlement.year && d.month === settlement.month);
                    const period = `${settlement.year}-${settlement.month.toString().padStart(2, '0')}`;
                    const totalValue = settlement.items.reduce((sum, item) => sum + (item.hours * (item.rate || 0)), 0);
                    
                    return (
                    <div key={settlement.id} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-t-lg flex justify-between items-center">
                            <h3 className="font-semibold text-lg">{period}</h3>
                            <div className="flex gap-2 justify-end">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(settlement)}>
                                    <EditIcon />
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(settlement.id)}>
                                    <TrashIcon />
                                </Button>
                            </div>
                        </div>

                        <div className="p-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Klient</TableHead>
                                        <TableHead>Nr Zamówienia</TableHead>
                                        <TableHead>Typ Pracy</TableHead>
                                        <TableHead className="text-right">Godziny</TableHead>
                                        <TableHead className="text-right">Stawka</TableHead>
                                        <TableHead className="text-right">Wartość</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {settlement.items.map(item => {
                                        const {orderNumber, clientName} = getOrderInfo(item.orderId);
                                        return (
                                        <TableRow key={item.id}>
                                            <TableCell>{clientName}</TableCell>
                                            <TableCell>{orderNumber}</TableCell>
                                            <TableCell>{item.itemType}</TableCell>
                                            <TableCell className="text-right">{item.hours.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">{item.rate.toFixed(2)} PLN</TableCell>
                                            <TableCell className="font-medium text-right">{(item.hours * item.rate).toFixed(2)} PLN</TableCell>
                                        </TableRow>
                                    )})}
                                     <TableRow className="bg-gray-50 dark:bg-gray-800 font-bold">
                                        <TableCell colSpan={5} className="text-right">Suma</TableCell>
                                        <TableCell className="text-right">{totalValue.toFixed(2)} PLN</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                        <MonthlyDocumentsManager 
                            key={period}
                            year={settlement.year}
                            month={settlement.month}
                            monthlyDocument={monthlyDocument}
                            addOrUpdateMonthlyDocument={addOrUpdateMonthlyDocument}
                        />
                    </div>
                )})}
            </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Potwierdzenie usunięcia"
        description="Czy na pewno chcesz usunąć to rozliczenie? Wszystkie pozycje z tego miesiąca zostaną usunięte."
      />
    </div>
  );
};

export default Settlements;
