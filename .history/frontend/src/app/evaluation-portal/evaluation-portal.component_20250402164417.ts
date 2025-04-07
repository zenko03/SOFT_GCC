  private startTimer() {
    // Récupérer le temps restant depuis le backend
    this.evaluationService.getTimeRemaining(this.evaluationId).subscribe({
      next: (timeRemaining: number) => {
        this.timeRemaining = timeRemaining;
        this.timerInterval = setInterval(() => {
          if (this.timeRemaining > 0) {
            this.timeRemaining--;
          } else {
            this.stopTimer();
            this.submitEvaluation();
          }
        }, 1000);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du temps restant:', error);
        this.stopTimer();
      }
    });
  } 