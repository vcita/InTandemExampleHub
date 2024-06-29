let chatUID;


async function createNewChat(businessToken) {
  try {
    const response = await fetch('https://api.vcita.biz/v3/ai/bizai_chats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + businessToken
      },
      body: JSON.stringify({ agent: 'vanilla', config: { window_size: 1 } })
    });
    const data = await response.json();
    chatUID = data.data.uid;
    console.log('New chat created:', data);
    document.getElementById('chatBox').innerHTML = '<p>New chat started.</p>';
  } catch (error) {
    console.error('Error creating new chat:', error);
  }
}

async function sendMessage(businessToken) {
  const userMessage = document.getElementById('userMessage').value;
  if (!chatUID) {
    alert('Please start a new chat first.');
    return;
  }

  appendMessage('User', userMessage);
  document.getElementById('userMessage').value = '';


  const body = {
    "type": "text",
    "content": {
      "text": userMessage
    },
    "streaming": true
  };
  try {
    const response = await fetch(`https://api.vcita.biz/v3/ai/bizai_chat_messages?bizai_chat_uid=${chatUID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + businessToken
      },

      body: JSON.stringify(body)
    }).then(async (response) => {
      if (!response.ok) {
        throw response;
      }
      await processStream(response)
    })
      .catch((error) => {
        // Do something with the error
        console.error('Error:', error);
      });

  } catch (error) {
    console.error('Error sending message:', error);
  }
}

function appendMessage(sender, message) {
  const chatBox = document.getElementById('chatBox');
  const messageElement = document.createElement('p');
  messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function processStream(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let finishReasonMet = false;

  let accumulatedData = '';
  try {
    let reading = true;
    let { value, done } = await reader.read();
    while (reading) {
      if (done) {
        reading = false;
      }

      buffer += decoder.decode(value, { stream: true });
      const { remainingBuffer, parsedData } = processBuffer(buffer);
      buffer = remainingBuffer;
      for (let i = 0; i < parsedData.length; i++) {
        const parsed = parsedData[i];
        finishReasonMet = finishReasonMet || parsed.finish_reason === 'stop';
        if (parsed.delta) {
          accumulatedData += parsed.delta;
        }
      }
      if (!done) {
        ({ value, done } = await reader.read());
      }
    }
    if (!finishReasonMet) {
      console.error('Stream did not end with the expected \'stop\' finish reason.');
    }
  } catch (err) {
    console.error('Error reading stream:', err);
  } finally {
    //await this.endStream(accumulatedData);
    appendMessage('Bot', accumulatedData);
    console.log('accumulatedData:', accumulatedData);
    reader.releaseLock();
  }
}

function processBuffer(buffer) {
  let remainingBuffer = buffer;
  let eolIndex = remainingBuffer.indexOf('\n');
  const parsedData = [];
  while (eolIndex !== -1) {
    const line = remainingBuffer.slice(0, eolIndex).trim();
    remainingBuffer = remainingBuffer.slice(eolIndex + 1);
    if (line) {
      const parsed = JSON.parse(line);
      parsedData.push(parsed);
    }
    eolIndex = remainingBuffer.indexOf('\n');
  }
  return { remainingBuffer, parsedData };
}