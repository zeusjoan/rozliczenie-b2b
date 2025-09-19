import React, { useState, useEffect } from 'react';
import type { Client } from '../types';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import PlusIcon from '../components/icons/PlusIcon';
import TrashIcon from '../components/icons/TrashIcon';
import EditIcon from '../components/icons/EditIcon';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';

interface ClientsProps {
  clients: Client[];
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (client: Client) => void;
  deleteClient: (clientId: string) => void;
}

const Clients: React.FC<ClientsProps> = ({ clients, addClient, updateClient, deleteClient }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [phone, setPhone] = useState('');
  const [emails, setEmails] = useState<string[]>(['']);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (editingClient) {
      setName(editingClient.name);
      setNip(editingClient.nip);
      setPhone(editingClient.phone || '');
      setEmails(editingClient.emails && editingClient.emails.length > 0 ? editingClient.emails : ['']);
      setShowForm(true);
    }
  }, [editingClient]);
  
  const handleCancel = () => {
      setShowForm(false);
      setEditingClient(null);
      setName('');
      setNip('');
      setPhone('');
      setEmails(['']);
  };
  
  const handleAddNew = () => {
    setEditingClient(null);
    setName('');
    setNip('');
    setPhone('');
    setEmails(['']);
    setShowForm(true);
  }
  
  const handleEdit = (client: Client) => {
      setEditingClient(client);
  };

  const handleDeleteClick = (clientId: string) => {
    setClientToDelete(clientId);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete);
    }
    setIsConfirmOpen(false);
    setClientToDelete(null);
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const addEmailInput = () => {
    setEmails([...emails, '']);
  };

  const removeEmailInput = (index: number) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && nip) {
      const clientData = {
        name,
        nip,
        phone,
        emails: emails.filter(email => email.trim() !== ''),
      };
      if (editingClient) {
        updateClient({ ...editingClient, ...clientData });
      } else {
        addClient(clientData);
      }
      handleCancel();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary dark:text-white">Klienci</h1>
        <Button onClick={showForm && !editingClient ? handleCancel : handleAddNew}>
            <PlusIcon className="w-4 h-4 mr-2" />
            {showForm && !editingClient ? 'Anuluj' : 'Dodaj Klienta'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingClient ? 'Edytuj Klienta' : 'Nowy Klient'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nazwa Klienta"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="np. Global Tech Inc."
                required
              />
              <Input
                label="NIP"
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="np. 123-456-78-90"
                required
              />
              <Input
                label="Telefon"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="np. 111-222-333"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adresy Email</label>
                {emails.map((email, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => handleEmailChange(index, e.target.value)}
                            placeholder="np. contact@example.com"
                        />
                        <Button type="button" variant="destructive" size="icon" onClick={() => removeEmailInput(index)}>
                            <TrashIcon />
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="secondary" onClick={addEmailInput}>
                    <PlusIcon className="w-4 h-4 mr-2"/> Dodaj Email
                </Button>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" type="button" onClick={handleCancel}>Anuluj</Button>
                <Button type="submit">{editingClient ? 'Zapisz Zmiany' : 'Zapisz Klienta'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle>Lista Klientów</CardTitle>
            <CardDescription>Zarządzaj swoimi klientami.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nazwa Klienta</TableHead>
                        <TableHead>NIP</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead>Emaile</TableHead>
                        <TableHead className="text-right">Akcje</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clients.map((client) => (
                        <TableRow key={client.id}>
                            <TableCell className="font-medium">{client.name}</TableCell>
                            <TableCell>{client.nip}</TableCell>
                            <TableCell>{client.phone}</TableCell>
                            <TableCell>{(client.emails || []).join(', ')}</TableCell>
                            <TableCell>
                               <div className="flex gap-2 justify-end">
                                   <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
                                       <EditIcon />
                                   </Button>
                                   <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(client.id)}>
                                       <TrashIcon />
                                   </Button>
                               </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Potwierdzenie usunięcia"
        description="Czy na pewno chcesz usunąć tego klienta? Usunięcie klienta spowoduje również usunięcie wszystkich powiązanych zamówień i rozliczeń."
      />
    </div>
  );
};

export default Clients;