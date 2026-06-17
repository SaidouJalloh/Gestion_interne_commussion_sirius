import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Send,
  Clock,
  FileText,
  Download,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import { API_ENDPOINTS, getApiHeaders } from '../../config/api';
import { Card, Badge } from '../components/ui';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'secondary';

const STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  recu: { label: 'Reçu', variant: 'primary' },
  en_cours: { label: 'En cours', variant: 'warning' },
  expertise: { label: 'Expertise', variant: 'primary' },
  traite: { label: 'Traité', variant: 'success' },
  cloture: { label: 'Clôturé', variant: 'secondary' },
  rejete: { label: 'Rejeté', variant: 'danger' },
};

const getStatusInfo = (statut: string) =>
  STATUS_MAP[statut?.toLowerCase()] || { label: statut || 'N/A', variant: 'primary' as BadgeVariant };

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

const formatDateTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
};

const SinistreDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sinistre, setSinistre] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const fetchSinistre = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const headers = await getApiHeaders(false);
      const response = await fetch(API_ENDPOINTS.clientPortal.sinistreById(id), { headers });
      const result = await response.json();
      if (result.success) {
        setSinistre(result.data);
      } else {
        setError(result.message || 'Erreur lors du chargement du sinistre.');
      }
    } catch (e: any) {
      setError(e.message || 'Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSinistre();
  }, [fetchSinistre]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !id) return;
    setSending(true);
    try {
      const headers = await getApiHeaders(false);
      const response = await fetch(API_ENDPOINTS.clientPortal.sendMessage(id), {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: message.trim() }),
      });
      const result = await response.json();
      if (result.success) {
        setMessage('');
        fetchSinistre();
      }
    } catch {
      // Silently handle
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error || !sinistre) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-danger-500" />
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          {error || 'Sinistre introuvable.'}
        </p>
        <button
          onClick={() => navigate('/client/sinistres')}
          className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium"
        >
          Retour aux sinistres
        </button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(sinistre.statut);
  const historique = (sinistre.sinistres_historique || []).filter(
    (h: any) => h.visible_client
  );
  const messages = sinistre.sinistres_messages || [];
  const documents = sinistre.sinistres_documents || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button & Header */}
      <div>
        <button
          onClick={() => navigate('/client/sinistres')}
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux sinistres
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sinistre {sinistre.numero_sinistre}
          </h1>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>
      </div>

      {/* Sinistre Info */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Informations du sinistre
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Type</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {sinistre.type_sinistre || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date du sinistre</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatDate(sinistre.date_sinistre)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lieu</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {sinistre.lieu_sinistre || 'N/A'}
            </p>
          </div>
        </div>
        {sinistre.description && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{sinistre.description}</p>
          </div>
        )}
      </Card>

      {/* Timeline */}
      {historique.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-500" />
            Suivi du dossier
          </h2>
          <div className="relative pl-6 space-y-6">
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />
            {historique.map((entry: any, index: number) => (
              <div key={entry.id || index} className="relative">
                <div className="absolute -left-4 top-1 w-3 h-3 rounded-full border-2 border-primary-500 bg-white dark:bg-gray-800" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {entry.action || entry.titre || 'Mise à jour'}
                  </p>
                  {entry.commentaire && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {entry.commentaire}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatDateTime(entry.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Documents */}
      {documents.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-500" />
            Documents
          </h2>
          <div className="space-y-2">
            {documents.map((doc: any, index: number) => (
              <div
                key={doc.id || index}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {doc.nom_fichier || doc.nom || 'Document'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDate(doc.created_at)}
                    </p>
                  </div>
                </div>
                {doc.url && (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 flex-shrink-0 ml-3"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Messages */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary-500" />
          Messages
        </h2>

        {messages.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
            Aucun message pour le moment.
          </p>
        ) : (
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {messages.map((msg: any, index: number) => {
              const isClient = msg.expediteur === 'client';
              return (
                <div
                  key={msg.id || index}
                  className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      isClient
                        ? 'bg-primary-500 text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isClient ? 'text-primary-200' : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {formatDateTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Send message form */}
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Écrire un message..."
              rows={2}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 resize-none dark:text-white text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim() || sending}
            className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl shadow-lg shadow-primary-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default SinistreDetail;
