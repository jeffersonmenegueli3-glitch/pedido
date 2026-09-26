// Helper utilities for Google Drive & Google Tasks REST APIs

// 1. GOOGLE DRIVE API FUNCTIONS

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  createdTime?: string;
  size?: string;
}

export async function listDriveFiles(accessToken: string): Promise<DriveFile[]> {
  try {
    const res = await fetch(
      'https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id,name,mimeType,webViewLink,iconLink,createdTime,size)&orderBy=createdTime%20desc',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Erro ao listar arquivos do Google Drive');
    }
    const data = await res.json();
    return data.files || [];
  } catch (err: any) {
    console.error('Drive list error:', err);
    throw err;
  }
}

export async function uploadTextToDrive(
  accessToken: string,
  fileName: string,
  content: string,
  mimeType: string = 'text/plain'
): Promise<DriveFile> {
  try {
    const metadata = {
      name: fileName,
      mimeType: mimeType,
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([content], { type: mimeType }));

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Erro ao fazer upload para o Google Drive');
    }

    return await res.json();
  } catch (err: any) {
    console.error('Drive upload error:', err);
    throw err;
  }
}

// 2. GOOGLE TASKS API FUNCTIONS

export interface GoogleTask {
  id?: string;
  title: string;
  notes?: string;
  due?: string; // ISO 8601 string
  status?: 'needsAction' | 'completed';
}

export async function listGoogleTasks(accessToken: string): Promise<GoogleTask[]> {
  try {
    const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Erro ao listar tarefas do Google Tasks');
    }

    const data = await res.json();
    return data.items || [];
  } catch (err: any) {
    console.error('Tasks list error:', err);
    throw err;
  }
}

export async function createGoogleTask(accessToken: string, task: GoogleTask): Promise<GoogleTask> {
  try {
    const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Erro ao criar tarefa no Google Tasks');
    }

    return await res.json();
  } catch (err: any) {
    console.error('Tasks create error:', err);
    throw err;
  }
}

export async function completeGoogleTask(accessToken: string, taskId: string): Promise<void> {
  try {
    const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'completed' }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Erro ao concluir tarefa no Google Tasks');
    }
  } catch (err: any) {
    console.error('Tasks complete error:', err);
    throw err;
  }
}
