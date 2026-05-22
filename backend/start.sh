#!/bin/sh
set -e

echo "Pushing database schema..."
npx prisma db push --accept-data-loss

echo "Seeding admin user and tasks if needed..."
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seed() {
  if (await prisma.user.count() === 0) {
    const hash = await bcrypt.hash('Admin@123', 12);
    await prisma.user.create({ data: { username: 'admin', password: hash } });
    console.log('Seeded: admin / Admin@123');
  }

  if (await prisma.task.count() > 0) { console.log('Tasks present, skipping.'); return; }

  const tasks = [
    {id:1,  taskName:'Project Kickoff & Planning',           location:'All Locations',  startDate:new Date('2026-05-25'), endDate:new Date('2026-05-28'), dependencyIds:null,       status:'In Progress', priority:'High'},
    {id:2,  taskName:'Budget Approval & Advance Request',    location:'All Locations',  startDate:new Date('2026-05-29'), endDate:new Date('2026-06-01'), dependencyIds:'1',         status:'Planned',     priority:'High'},
    {id:3,  taskName:'Vendor Finalization',                  location:'All Locations',  startDate:new Date('2026-06-02'), endDate:new Date('2026-06-05'), dependencyIds:'2',         status:'Planned',     priority:'Medium'},
    {id:4,  taskName:'Advance Payment Release',              location:'All Locations',  startDate:new Date('2026-06-06'), endDate:new Date('2026-06-08'), dependencyIds:'3',         status:'Planned',     priority:'High'},
    {id:5,  taskName:'License Procurement',                  location:'All Locations',  startDate:new Date('2026-06-06'), endDate:new Date('2026-06-10'), dependencyIds:'4',         status:'Planned',     priority:'Medium'},
    {id:6,  taskName:'CCTV Material Procurement',            location:'All Locations',  startDate:new Date('2026-06-07'), endDate:new Date('2026-06-15'), dependencyIds:'4',         status:'Planned',     priority:'Medium'},
    {id:7,  taskName:'System Inventory & Audit',             location:'Mangaluru',      startDate:new Date('2026-05-29'), endDate:new Date('2026-06-03'), dependencyIds:'1',         status:'Planned',     priority:'Medium'},
    {id:8,  taskName:'Windows Installation',                 location:'Mangaluru',      startDate:new Date('2026-06-04'), endDate:new Date('2026-06-10'), dependencyIds:'5,7',       status:'Planned',     priority:'Medium'},
    {id:9,  taskName:'Microsoft Desktop Apps Installation',  location:'Mangaluru',      startDate:new Date('2026-06-11'), endDate:new Date('2026-06-14'), dependencyIds:'8',         status:'Planned',     priority:'Medium'},
    {id:10, taskName:'Compliance Audit',                     location:'Mangaluru',      startDate:new Date('2026-06-15'), endDate:new Date('2026-06-18'), dependencyIds:'9',         status:'Planned',     priority:'High'},
    {id:11, taskName:'CCTV Site Survey',                     location:'Mangaluru',      startDate:new Date('2026-06-19'), endDate:new Date('2026-06-22'), dependencyIds:'10',        status:'Planned',     priority:'Medium'},
    {id:12, taskName:'CCTV Planning & BOQ',                  location:'Mangaluru',      startDate:new Date('2026-06-23'), endDate:new Date('2026-06-27'), dependencyIds:'11',        status:'Planned',     priority:'Medium'},
    {id:13, taskName:'CCTV Implementation',                  location:'Mangaluru',      startDate:new Date('2026-06-28'), endDate:new Date('2026-07-08'), dependencyIds:'6,12',      status:'Planned',     priority:'High'},
    {id:14, taskName:'Interim Vendor Payment',               location:'Mangaluru',      startDate:new Date('2026-07-02'), endDate:new Date('2026-07-03'), dependencyIds:'13',        status:'Planned',     priority:'Medium'},
    {id:15, taskName:'System Inventory & Audit',             location:'Shivamogga',     startDate:new Date('2026-06-02'), endDate:new Date('2026-06-06'), dependencyIds:'1',         status:'Planned',     priority:'Medium'},
    {id:16, taskName:'Windows Installation',                 location:'Shivamogga',     startDate:new Date('2026-06-07'), endDate:new Date('2026-06-13'), dependencyIds:'5,15',      status:'Planned',     priority:'Medium'},
    {id:17, taskName:'Microsoft Desktop Apps Installation',  location:'Shivamogga',     startDate:new Date('2026-06-14'), endDate:new Date('2026-06-17'), dependencyIds:'16',        status:'Planned',     priority:'Medium'},
    {id:18, taskName:'Compliance Audit',                     location:'Shivamogga',     startDate:new Date('2026-06-18'), endDate:new Date('2026-06-21'), dependencyIds:'17',        status:'Planned',     priority:'High'},
    {id:19, taskName:'CCTV Site Survey',                     location:'Shivamogga',     startDate:new Date('2026-06-22'), endDate:new Date('2026-06-25'), dependencyIds:'18',        status:'Planned',     priority:'Medium'},
    {id:20, taskName:'CCTV Planning & BOQ',                  location:'Shivamogga',     startDate:new Date('2026-06-26'), endDate:new Date('2026-06-30'), dependencyIds:'19',        status:'Planned',     priority:'Medium'},
    {id:21, taskName:'CCTV Implementation',                  location:'Shivamogga',     startDate:new Date('2026-07-01'), endDate:new Date('2026-07-10'), dependencyIds:'6,20',      status:'Planned',     priority:'High'},
    {id:22, taskName:'Interim Vendor Payment',               location:'Shivamogga',     startDate:new Date('2026-07-04'), endDate:new Date('2026-07-05'), dependencyIds:'21',        status:'Planned',     priority:'Medium'},
    {id:23, taskName:'System Inventory & Audit',             location:'Hassan',         startDate:new Date('2026-06-05'), endDate:new Date('2026-06-09'), dependencyIds:'1',         status:'Planned',     priority:'Medium'},
    {id:24, taskName:'Windows Installation',                 location:'Hassan',         startDate:new Date('2026-06-10'), endDate:new Date('2026-06-16'), dependencyIds:'5,23',      status:'Planned',     priority:'Medium'},
    {id:25, taskName:'Microsoft Desktop Apps Installation',  location:'Hassan',         startDate:new Date('2026-06-17'), endDate:new Date('2026-06-20'), dependencyIds:'24',        status:'Planned',     priority:'Medium'},
    {id:26, taskName:'Compliance Audit',                     location:'Hassan',         startDate:new Date('2026-06-21'), endDate:new Date('2026-06-24'), dependencyIds:'25',        status:'Planned',     priority:'High'},
    {id:27, taskName:'CCTV Site Survey',                     location:'Hassan',         startDate:new Date('2026-06-25'), endDate:new Date('2026-06-28'), dependencyIds:'26',        status:'Planned',     priority:'Medium'},
    {id:28, taskName:'CCTV Planning & BOQ',                  location:'Hassan',         startDate:new Date('2026-06-29'), endDate:new Date('2026-07-03'), dependencyIds:'27',        status:'Planned',     priority:'Medium'},
    {id:29, taskName:'CCTV Implementation',                  location:'Hassan',         startDate:new Date('2026-07-04'), endDate:new Date('2026-07-14'), dependencyIds:'6,28',      status:'Planned',     priority:'High'},
    {id:30, taskName:'Interim Vendor Payment',               location:'Hassan',         startDate:new Date('2026-07-08'), endDate:new Date('2026-07-09'), dependencyIds:'29',        status:'Planned',     priority:'Medium'},
    {id:31, taskName:'System Inventory & Audit',             location:'Chikkamagaluru', startDate:new Date('2026-06-08'), endDate:new Date('2026-06-12'), dependencyIds:'1',         status:'Planned',     priority:'Medium'},
    {id:32, taskName:'Windows Installation',                 location:'Chikkamagaluru', startDate:new Date('2026-06-13'), endDate:new Date('2026-06-19'), dependencyIds:'5,31',      status:'Planned',     priority:'Medium'},
    {id:33, taskName:'Microsoft Desktop Apps Installation',  location:'Chikkamagaluru', startDate:new Date('2026-06-20'), endDate:new Date('2026-06-23'), dependencyIds:'32',        status:'Planned',     priority:'Medium'},
    {id:34, taskName:'Compliance Audit',                     location:'Chikkamagaluru', startDate:new Date('2026-06-24'), endDate:new Date('2026-06-27'), dependencyIds:'33',        status:'Planned',     priority:'High'},
    {id:35, taskName:'CCTV Site Survey',                     location:'Chikkamagaluru', startDate:new Date('2026-06-28'), endDate:new Date('2026-07-01'), dependencyIds:'34',        status:'Planned',     priority:'Medium'},
    {id:36, taskName:'CCTV Planning & BOQ',                  location:'Chikkamagaluru', startDate:new Date('2026-07-02'), endDate:new Date('2026-07-06'), dependencyIds:'35',        status:'Planned',     priority:'Medium'},
    {id:37, taskName:'CCTV Implementation',                  location:'Chikkamagaluru', startDate:new Date('2026-07-07'), endDate:new Date('2026-07-17'), dependencyIds:'6,36',      status:'Planned',     priority:'High'},
    {id:38, taskName:'Interim Vendor Payment',               location:'Chikkamagaluru', startDate:new Date('2026-07-10'), endDate:new Date('2026-07-11'), dependencyIds:'37',        status:'Planned',     priority:'Medium'},
    {id:39, taskName:'Final Audit & Testing',                location:'All Locations',  startDate:new Date('2026-07-18'), endDate:new Date('2026-07-20'), dependencyIds:'13,21,29,37', status:'Planned',   priority:'High'},
    {id:40, taskName:'Final Vendor Payment & Closure',       location:'All Locations',  startDate:new Date('2026-07-21'), endDate:new Date('2026-07-22'), dependencyIds:'39',        status:'Planned',     priority:'High'},
  ];

  for (const {id: _id, ...t} of tasks) {
    await prisma.task.create({ data: { ...t, projectName: 'NGI IT Infrastructure & CCTV Project 2026', assignedTo: 'Jegan' } });
  }
  console.log('Seeded: 40 IT project tasks');
}

seed()
  .catch(e => { console.error('Seed error:', e.message); process.exit(1); })
  .finally(() => prisma.\$disconnect());
"

echo "Starting API server..."
exec node dist/index.js
