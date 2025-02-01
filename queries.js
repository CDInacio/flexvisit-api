
// Função para gerar e inserir os horarios disponíveis para cada data
function generateSchedules() {
  const schedules = [
    {
      date: "07/09/2024",
      timeslots: [
        { time: "09:00", available: true },
        { time: "10:00", available: false },
        { time: "11:00", available: true }
      ]
    },
    {
      date: "08/09/2024",
      timeslots: [
        { time: "09:00", available: true },
        { time: "10:00", available: true },
        { time: "11:00", available: true }
      ]
    },
    {
      date: "09/09/2024",
      timeslots: [
        { time: "09:00", available: true },
        { time: "10:00", available: true },
        { time: "11:00", available: false }
      ]
    }
  ];

  schedules.forEach(schedule => {
    // Inserir o Schedule primeiro para obter seu ID
    const scheduleResult = db.Schedule.insertOne({
      date: schedule.date,
      timeslots: []  // Vamos adicionar os IDs dos timeslots mais tarde
    });

    const scheduleId = scheduleResult.insertedId;  // Captura o ID do Schedule

    // Inserir Timeslots com a referência ao Schedule criado
    const timeslotIds = schedule.timeslots.map(timeslot => {
      const result = db.Timeslot.insertOne({
        time: timeslot.time,
        available: timeslot.available,
        scheduleId: scheduleId  // Associar ao Schedule
      });
      return result.insertedId;  // Captura o ID gerado para o Timeslot
    });

    // Atualizar o Schedule com os IDs dos Timeslots
    db.Schedule.updateOne(
      { _id: scheduleId },
      { $set: { timeslots: timeslotIds } }
    );
  });
}

generateSchedules();
