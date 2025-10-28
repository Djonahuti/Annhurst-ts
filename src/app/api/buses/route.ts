import { NextResponse } from 'next/server';
import { PrismaClient, buses, coordinators } from '@prisma/client';

const prisma = new PrismaClient();

// Define the type for bus with coordinator relation
type BusWithCoordinator = buses & {
  coordinator_rel: Pick<coordinators, 'id' | 'name' | 'email' | 'phone'> | null;
};

export async function GET(request: Request) {
  try {
    // If driverId is provided, return buses for that driver; otherwise return all buses
    const { searchParams } = new URL(request.url);
    const driverIdParam = searchParams.get('driverId');
    const unassigned = searchParams.get('unassigned');

    const parsedDriverId = driverIdParam ? parseInt(driverIdParam) : undefined;
    if (driverIdParam && isNaN(parsedDriverId!)) {
      return NextResponse.json({ error: 'Invalid driver ID' }, { status: 400 });
    }

    const buses = await prisma.buses.findMany({
      where: parsedDriverId !== undefined
        ? { driver: parsedDriverId }
        : (unassigned === 'true' ? { driver: null } : undefined),
      include: {
        coordinator_rel: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const formattedBuses = buses.map((bus: BusWithCoordinator) => ({
      id: Number(bus.id),
      bus_code: bus.bus_code,
      plate_no: bus.plate_no,
      contract_date: bus.contract_date,
      start_date: bus.start_date,
      date_collected: bus.date_collected,
      agreed_date: bus.agreed_date,
      t_income: bus.t_income,
      initial_owe: bus.initial_owe,
      coordinator_name: bus.coordinator_rel?.name || 'N/A',
      coordinator_email: bus.coordinator_rel?.email || 'N/A',
      coordinator_phone: bus.coordinator_rel?.phone || [],
      coordinator_id: bus.coordinator_rel ? Number(bus.coordinator_rel.id) : null,
    }));

    return NextResponse.json(formattedBuses);
  } catch (error) {
    console.error('Error fetching buses:', error);
    return NextResponse.json({ error: 'Failed to fetch buses' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      bus_code,
      plate_no,
      driver,
      coordinator,
      letter,
      e_payment,
      contract_date,
      agreed_date,
      date_collected,
      start_date,
      first_pay,
      initial_owe,
      deposited,
      t_income,
    } = body;

    await prisma.buses.create({
      data: {
        bus_code: bus_code || null,
        plate_no: plate_no || null,
        driver: driver ? BigInt(driver) : null,
        coordinator: coordinator ? BigInt(coordinator) : null,
        letter: letter !== null ? letter : null,
        e_payment: e_payment ? BigInt(e_payment) : null,
        contract_date: contract_date ? new Date(contract_date) : null,
        agreed_date: agreed_date ? new Date(agreed_date) : null,
        date_collected: date_collected ? new Date(date_collected) : null,
        start_date: start_date ? new Date(start_date) : null,
        first_pay: first_pay ? new Date(first_pay) : null,
        initial_owe: initial_owe ? BigInt(initial_owe) : null,
        deposited: deposited ? BigInt(deposited) : null,
        t_income: t_income ? BigInt(t_income) : null,
      },
    });

    return NextResponse.json({ message: 'Bus added successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error adding bus:', error);
    return NextResponse.json({ error: 'Failed to add bus' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}