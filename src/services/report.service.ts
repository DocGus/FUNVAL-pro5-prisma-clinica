import {
  getAppointmentsBySpecialty,
  getDailyCutoff,
} from "../models/report.model.js";

export const appointmentsBySpecialtyReport = () =>
  getAppointmentsBySpecialty();

export const dailyCutoffReport = async (date: string) => {
  const rows = await getDailyCutoff(date);

  const counts = {
    COMPLETADA: 0,
    CANCELADA: 0,
  };

  for (const row of rows) {
    counts[row.status] = row.total;
  }

  return { date, counts };
};
