export const USERS = [
  {
    id: 'u001',
    email: 'jane.doe@email.com',
    passcode: 'patient123',
    role: 'patient',
    name: 'Jane Doe',
    initials: 'JD',
    avatar: {
      from: 'from-indigo-400',
      to: 'to-violet-500',
    },
  },
  {
    id: 'u002',
    email: 'dr.chen@healthai.vn',
    passcode: 'doctor123',
    role: 'doctor',
    name: 'Dr. Sarah Chen',
    initials: 'SC',
    specialty: 'General Practice',
    avatar: {
      from: 'from-teal-400',
      to: 'to-indigo-500',
    },
  },
  {
    id: 'u003',
    email: 'dr.reid@healthai.vn',
    passcode: 'doctor123',
    role: 'doctor',
    name: 'Dr. Marcus Reid',
    initials: 'MR',
    specialty: 'General Practice',
    avatar: {
      from: 'from-violet-400',
      to: 'to-indigo-500',
    },
  },
  {
    id: 'u004',
    email: 'admin@healthai.vn',
    passcode: 'admin123',
    role: 'admin',
    name: 'Nguyen Van Admin',
    initials: 'NA',
    avatar: {
      from: 'from-rose-400',
      to: 'to-orange-500',
    },
  },
]

export const findUser = (email, password) => {
  return USERS.find(
    (u) =>
      u.email.toLowerCase() ===
        email.toLowerCase() &&
      u.passcode === password,
  ) || null
}
