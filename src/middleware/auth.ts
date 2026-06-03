import { NextRequest } from 'next/server';

export function checkAdminAuth(request: NextRequest): boolean {
  // Check if admin is authenticated via cookie or session
  const adminAuth = request.cookies.get('adminAuth')?.value;
  if (adminAuth === 'true') return true;

  // Allow non-browser clients (e.g. React Native) to pass an explicit header
  const headerAuth = request.headers.get('x-admin-auth');
  return headerAuth === 'true';
}

export function checkUserAuth(request: NextRequest): boolean {
  // Check if user is authenticated via cookie or session
  const userAuth = request.cookies.get('userAuth')?.value;
  return userAuth === 'true';
}

export function checkBuilderAuth(request: NextRequest): boolean {
  // Check if user is authenticated and has Builder role
  const userAuth = request.cookies.get('userAuth')?.value;
  const userDataCookie = request.cookies.get('userData')?.value;
  
  if (userAuth !== 'true' || !userDataCookie) {
    return false;
  }
  
  try {
    const userData = JSON.parse(userDataCookie);
    return userData.role === 'Builder';
  } catch {
    return false;
  }
}
