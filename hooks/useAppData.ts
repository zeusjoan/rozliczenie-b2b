
import { useState, useEffect } from 'react';
import type { Client, Order, Settlement, SettlementItem, MonthlyDocument } from '../types';
import { OrderStatus, OrderItemType } from '../types';

const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'Global Tech Inc.', nip: '123-456-78-90', phone: '111-222-333', emails: ['contact@globaltech.com', 'support@globaltech.com'] },
  { id: 'c2', name: 'Innovate Solutions', nip: '098-765-43-21', phone: '444-555-666', emails: ['info@innovate.com'] },
];

const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    clientId: 'c1',
    orderNumber: 'ORD/2024/001',
    supplierNumber: 'SUP/A/55',
    documentDate: '2024-01-15',
    deliveryDate: '2024-12-31',
    contractNumber: 'CON/2024/XYZ',
    orderingPerson: 'Jan Kowalski',
    status: OrderStatus.ACTIVE,
    items: [
      { type: OrderItemType.CONSULTATIONS, hours: 50, rate: 150 },
      { type: OrderItemType.OPEX, hours: 100, rate: 120 },
    ],
    attachments: [],
  },
  {
    id: 'o2',
    clientId: 'c2',
    orderNumber: 'ORD/2024/002',
    supplierNumber: 'SUP/B/77',
    documentDate: '2024-02-20',
    deliveryDate: '2024-06-30',
    contractNumber: 'CON/2024/ABC',
    orderingPerson: 'Anna Nowak',
    status: OrderStatus.ACTIVE,
    items: [
        { type: OrderItemType.CAPEX, hours: 200, rate: 200 },
    ],
    attachments: [],
  },
  {
    id: 'o3',
    clientId: 'c1',
    orderNumber: 'ORD/2023/050',
    supplierNumber: 'SUP/A/33',
    documentDate: '2023-11-10',
    deliveryDate: '2023-12-20',
    contractNumber: 'CON/2023/OLD',
    orderingPerson: 'Jan Kowalski',
    status: OrderStatus.ARCHIVED,
    items: [
        { type: OrderItemType.OPEX, hours: 40, rate: 100 },
    ],
    attachments: [],
  }
];

const MOCK_SETTLEMENTS: Settlement[] = [
    { 
        id: 'set-2024-01', 
        month: 1, 
        year: 2024,
        date: '2024-01-31',
        items: [
            { id: 'si1', orderId: 'o1', itemType: OrderItemType.CONSULTATIONS, hours: 10, rate: 150 },
            { id: 'si2', orderId: 'o1', itemType: OrderItemType.OPEX, hours: 25, rate: 120 },
        ]
    },
    { 
        id: 'set-2024-02', 
        month: 2, 
        year: 2024,
        date: '2024-02-28',
        items: [
            { id: 'si3', orderId: 'o1', itemType: OrderItemType.OPEX, hours: 30, rate: 120 },
        ]
    },
    {
        id: 'set-2024-03',
        month: 3,
        year: 2024,
        date: '2024-03-31',
        items: [
            { id: 'si4', orderId: 'o2', itemType: OrderItemType.CAPEX, hours: 80, rate: 200 },
        ]
    }
];


const MOCK_MONTHLY_DOCUMENTS: MonthlyDocument[] = [];

interface AppData {
  clients: Client[];
  orders: Order[];
  settlements: Settlement[];
  monthlyDocuments: MonthlyDocument[];
}

const INITIAL_DATA: AppData = {
  clients: [],
  orders: [],
  settlements: [],
  monthlyDocuments: [],
};

const MOCK_DATA: AppData = {
    clients: MOCK_CLIENTS,
    orders: MOCK_ORDERS,
    settlements: MOCK_SETTLEMENTS,
    monthlyDocuments: MOCK_MONTHLY_DOCUMENTS,
};

function useLocalStorage<T,>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

export function useAppData() {
  const [data, setData] = useLocalStorage<AppData>('appData', INITIAL_DATA);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const isDataPresent = localStorage.getItem('app_initialized_v4'); // Incremented version to force data reset
    if (!isDataPresent) {
      setData(MOCK_DATA);
      localStorage.setItem('app_initialized_v4', 'true');
    }
    setIsInitialized(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient = { ...client, id: crypto.randomUUID() };
    setData(prev => ({ ...prev, clients: [...prev.clients, newClient] }));
  };
  
  const updateClient = (updatedClient: Client) => {
    setData(prev => ({ 
        ...prev, 
        clients: prev.clients.map(c => c.id === updatedClient.id ? updatedClient : c) 
    }));
  };

  const deleteClient = (clientId: string) => {
    setData(prev => {
        const clientOrderIds = new Set(prev.orders
            .filter(order => order.clientId === clientId)
            .map(order => order.id));
        
        return {
            ...prev,
            clients: prev.clients.filter(client => client.id !== clientId),
            orders: prev.orders.filter(order => order.clientId !== clientId),
            settlements: prev.settlements.map(s => ({
                ...s,
                items: s.items.filter(item => !clientOrderIds.has(item.orderId))
            })).filter(s => s.items.length > 0)
        };
    });
  };

  const addOrder = (order: Omit<Order, 'id'>) => {
    const newOrder = { ...order, id: crypto.randomUUID() };
    setData(prev => ({ ...prev, orders: [...prev.orders, newOrder] }));
  };
  
  const updateOrder = (updatedOrder: Order) => {
    setData(prev => ({
        ...prev,
        orders: prev.orders.map(o => o.id === updatedOrder.id ? updatedOrder : o)
    }));
  };
  
  const deleteOrder = (orderId: string) => {
    setData(prev => ({
        ...prev,
        orders: prev.orders.filter(o => o.id !== orderId),
        settlements: prev.settlements.map(s => ({
            ...s,
            items: s.items.filter(item => item.orderId !== orderId)
        })).filter(s => s.items.length > 0)
    }));
  };

  const addSettlement = (settlement: Omit<Settlement, 'id'>) => {
    const newSettlement = { ...settlement, id: crypto.randomUUID() };
    setData(prev => ({ ...prev, settlements: [...prev.settlements, newSettlement] }));
  };
  
  const updateSettlement = (updatedSettlement: Settlement) => {
    setData(prev => ({
        ...prev,
        settlements: prev.settlements.map(s => s.id === updatedSettlement.id ? updatedSettlement : s)
    }));
  };

  const deleteSettlement = (settlementId: string) => {
    setData(prev => ({
        ...prev,
        settlements: prev.settlements.filter(s => s.id !== settlementId)
    }));
  };

  const addOrUpdateMonthlyDocument = (doc: MonthlyDocument) => {
    setData(prev => {
        const existingDocIndex = prev.monthlyDocuments.findIndex(d => d.id === doc.id);
        if (existingDocIndex > -1) {
            const newDocs = [...prev.monthlyDocuments];
            newDocs[existingDocIndex] = doc;
            return { ...prev, monthlyDocuments: newDocs };
        } else {
            return { ...prev, monthlyDocuments: [...prev.monthlyDocuments, doc] };
        }
    });
  };

  return {
    clients: data.clients,
    orders: data.orders,
    settlements: data.settlements,
    monthlyDocuments: data.monthlyDocuments,
    addClient,
    updateClient,
    deleteClient,
    addOrder,
    updateOrder,
    deleteOrder,
    addSettlement,
    updateSettlement,
    deleteSettlement,
    addOrUpdateMonthlyDocument,
    isInitialized,
  };
}