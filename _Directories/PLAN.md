./components/members/InviteAcceptView.tsx:47:22
Type error: Property 'token' does not exist on type 'AuthResponse'. Did you mean 'Token'?
  45 |     setErrorMessage(null);
  46 |     const response = await acceptInvite({ token, ...payload });
> 47 |     setAuth(response.token, response.user, response.organization);
     |                      ^
  48 |     router.push("/dashboard");
  49 |   };
  50 |
Next.js build worker exited with code: 1 and signal: null
Error: Command "npm run build" exited with 1