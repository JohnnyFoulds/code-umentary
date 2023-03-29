async function getChatGPTApiKey(openSettings) {
    let apiKey = localStorage.getItem('chatGPTApiKey');
    
    if (!apiKey) {
        await openSettings();
      apiKey = localStorage.getItem('chatGPTApiKey');
      
      while (!apiKey) {
        await openSettings();
        apiKey = localStorage.getItem('chatGPTApiKey');
      }
    }
    
    return apiKey;
}

function fetchMessages(messages) {
    const apiKey = $("#apiKey").val();
    const settings = {
        url: "https://api.openai.com/v1/chat/completions",
        method: "POST",
        headers: {
            "Authorization": "Bearer " + apiKey,
            "Content-Type": "application/json"
        },
        data: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: messages
        })
    };
    $.ajax(settings)
        .done(function(response) {
            const message = response.choices[0].message;
            messages.push({
                role: message.role,
                content: message.content
            });
            const htmlText = window.markdownit().render(message.content);
            const botMessageHtml = `<pre><div class="message left-side">${htmlText}</div></pre>`;
            chatbox.append(botMessageHtml).animate({ scrollTop: 20000000 }, "slow");
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            sendButton.val("Error").prop("disabled", false);
            const errorText = "Please provide a valid ChatGPT API key and try again.";
            const errorMessage = `<pre><div class="message left-side text-danger">${errorText}</div></pre>`;
            chatbox.append(errorMessage).animate({ scrollTop: 20000000 }, "slow");
        });
}
