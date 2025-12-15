import type { Request, Response, NextFunction } from 'express';
import { ContractService } from './contract.service';
import { apiResponse } from '../../utils/apiResponse';
import type {
  ContractIdParams,
  CreateContractInput,
  UpdateContractInput,
} from './contract.validation';

const service = new ContractService();

const toDecimalString = (value: number | string) => {
  if (typeof value === 'number') return String(value);
  return value;
};

const toDate = (value: string) => new Date(value);

export class ContractController {
  async getAll(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const contrats = await service.getAll();
      res.json(apiResponse.success(contrats));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as ContractIdParams;
      const contrat = await service.getById(id);
      if (!contrat) {
        res.status(404).json(apiResponse.error('Contrat non trouvé', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success(contrat));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as CreateContractInput;

      const data = {
        client_id: payload.client_id,
        compagnie_id: payload.compagnie_id,
        type_contrat: payload.type_contrat,
        prime_nette: toDecimalString(payload.prime_nette),
        montant_accessoire:
          payload.montant_accessoire === null || typeof payload.montant_accessoire === 'undefined'
            ? null
            : toDecimalString(payload.montant_accessoire as any),
        taux_commission: toDecimalString(payload.taux_commission),
        commission: toDecimalString(payload.commission),
        date_effet: toDate(payload.date_effet),
        date_expiration: toDate(payload.date_expiration),
        statut: payload.statut ?? undefined,
        fractionnement: payload.fractionnement ?? undefined,
        notes: payload.notes ?? undefined,
        evacuation_sanitaire:
          payload.evacuation_sanitaire === null || typeof payload.evacuation_sanitaire === 'undefined'
            ? null
            : toDecimalString(payload.evacuation_sanitaire as any),
        prime_regulation:
          payload.prime_regulation === null || typeof payload.prime_regulation === 'undefined'
            ? null
            : toDecimalString(payload.prime_regulation as any),
        immatriculation: payload.immatriculation ?? undefined,
        prime_ttc:
          payload.prime_ttc === null || typeof payload.prime_ttc === 'undefined'
            ? null
            : toDecimalString(payload.prime_ttc as any),
        fga:
          payload.fga === null || typeof payload.fga === 'undefined'
            ? null
            : toDecimalString(payload.fga as any),
        taxes:
          payload.taxes === null || typeof payload.taxes === 'undefined'
            ? null
            : toDecimalString(payload.taxes as any),
        is_flotte: payload.is_flotte ?? undefined,
        prime_ttc_initial:
          payload.prime_ttc_initial === null || typeof payload.prime_ttc_initial === 'undefined'
            ? null
            : toDecimalString(payload.prime_ttc_initial as any),
      };

      const created = await service.create(data);
      res.status(201).json(apiResponse.success(created));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as ContractIdParams;
      const payload = req.body as UpdateContractInput;

      const data: Record<string, unknown> = {};

      if (typeof payload.client_id === 'string') data.client_id = payload.client_id;
      if (typeof payload.compagnie_id === 'string') data.compagnie_id = payload.compagnie_id;
      if (typeof payload.type_contrat === 'string') data.type_contrat = payload.type_contrat;

      if (typeof payload.prime_nette !== 'undefined')
        data.prime_nette = payload.prime_nette === null ? null : toDecimalString(payload.prime_nette as any);

      if (typeof payload.montant_accessoire !== 'undefined')
        data.montant_accessoire =
          payload.montant_accessoire === null ? null : toDecimalString(payload.montant_accessoire as any);

      if (typeof payload.taux_commission !== 'undefined')
        data.taux_commission = payload.taux_commission === null ? null : toDecimalString(payload.taux_commission as any);

      if (typeof payload.commission !== 'undefined')
        data.commission = payload.commission === null ? null : toDecimalString(payload.commission as any);

      if (typeof payload.date_effet === 'string') data.date_effet = toDate(payload.date_effet);
      if (typeof payload.date_expiration === 'string')
        data.date_expiration = toDate(payload.date_expiration);

      if ('statut' in payload) data.statut = (payload as any).statut;
      if ('fractionnement' in payload) data.fractionnement = (payload as any).fractionnement;
      if ('notes' in payload) data.notes = (payload as any).notes;

      if (typeof payload.evacuation_sanitaire !== 'undefined')
        data.evacuation_sanitaire =
          payload.evacuation_sanitaire === null
            ? null
            : toDecimalString(payload.evacuation_sanitaire as any);

      if (typeof payload.prime_regulation !== 'undefined')
        data.prime_regulation =
          payload.prime_regulation === null ? null : toDecimalString(payload.prime_regulation as any);

      if ('immatriculation' in payload) data.immatriculation = (payload as any).immatriculation;

      if (typeof payload.prime_ttc !== 'undefined')
        data.prime_ttc = payload.prime_ttc === null ? null : toDecimalString(payload.prime_ttc as any);

      if (typeof payload.fga !== 'undefined')
        data.fga = payload.fga === null ? null : toDecimalString(payload.fga as any);

      if (typeof payload.taxes !== 'undefined')
        data.taxes = payload.taxes === null ? null : toDecimalString(payload.taxes as any);

      if (typeof payload.is_flotte === 'boolean') data.is_flotte = payload.is_flotte;

      if (typeof payload.prime_ttc_initial !== 'undefined')
        data.prime_ttc_initial =
          payload.prime_ttc_initial === null ? null : toDecimalString(payload.prime_ttc_initial as any);

      const updated = await service.update(id, data);
      if (!updated) {
        res.status(404).json(apiResponse.error('Contrat non trouvé', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success(updated));
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as ContractIdParams;
      const deleted = await service.delete(id);
      if (!deleted) {
        res.status(404).json(apiResponse.error('Contrat non trouvé', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success({ id }));
    } catch (error) {
      next(error);
    }
  }
}

export const contractController = new ContractController();


