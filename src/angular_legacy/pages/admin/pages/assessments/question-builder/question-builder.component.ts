import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Location } from '@angular/common';

@Component({
  selector: 'app-question-builder',
  templateUrl: './question-builder.component.html',
  styleUrls: ['./question-builder.component.css']
})
export class QuestionBuilderComponent implements OnInit {
  builderForm!: FormGroup;
  templateId!: string;
  isLoading: boolean = false;
  isFetching: boolean = false;
  templateTitle: string = 'Loading...';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private appService: AppService,
    private msg: NzMessageService,
    private location:Location
  ) {}

  ngOnInit(): void {
    this.templateId = this.route.snapshot.paramMap.get('id')!;
    
    // Initialize the main form holding the array of questions
    this.builderForm = this.fb.group({
      questions: this.fb.array([])
    });

    this.fetchTemplateData();
  }

  // Convenience getter for the questions array
  get questions(): FormArray {
    return this.builderForm.get('questions') as FormArray;
  }

  // Get options for a specific question
  getOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options_config') as FormArray;
  }

  fetchTemplateData(): void {
    this.isFetching = true;
    // 1. Fetch template details (to show the title)
    this.appService.getAssessmentTemplateById(this.templateId).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.templateTitle = res.data.title;
        }
      }
    });

    // 2. Fetch existing questions (We will assume you have an endpoint like this)
    // this.appService.getTemplateFields(this.templateId).subscribe(...)
    // For now, if empty, we just add one default question to start them off
    this.addQuestion();
    this.isFetching = false;
  }

  // --- Dynamic Form Manipulations ---

  addQuestion(): void {
    const questionGroup = this.fb.group({
      _id: [null], // Null for new questions
      input_type: ['MCQ', Validators.required],
      label: ['', Validators.required],
      points: [1, [Validators.required, Validators.min(0)]],
      is_required: [true],
      options_config: this.fb.array([]) // Options array
    });

    this.questions.push(questionGroup);
    
    // Auto-add two options if it's an MCQ to save the user clicks
    const newIndex = this.questions.length - 1;
    this.addOption(newIndex);
    this.addOption(newIndex);
  }

  removeQuestion(index: number): void {
    this.questions.removeAt(index);
    if (this.questions.length === 0) {
      this.addQuestion(); // Always keep at least one empty question
    }
  }

  addOption(questionIndex: number): void {
    const optionsArray = this.getOptions(questionIndex);
    optionsArray.push(this.fb.group({
      id: [this.generateOptionLetter(optionsArray.length)], // A, B, C...
      text: ['', Validators.required],
      isCorrect: [false]
    }));
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    this.getOptions(questionIndex).removeAt(optionIndex);
  }

  // Helper to generate A, B, C based on index
  generateOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  // Called when the user changes from MCQ to TEXT_SHORT
  onTypeChange(index: number): void {
    const type = this.questions.at(index).get('input_type')?.value;
    if (type === 'TEXT_SHORT') {
      this.getOptions(index).clear(); // Clear options if it's a text response
    } else if (this.getOptions(index).length === 0) {
      this.addOption(index);
      this.addOption(index);
    }
  }

  // --- Calculations ---

  getTotalScore(): number {
    let total = 0;
    this.questions.controls.forEach(control => {
      total += Number(control.get('points')?.value || 0);
    });
    return total;
  }

  // --- Saving ---

  saveQuestions(): void {
    if (this.builderForm.invalid) {
      this.msg.error('Please fill out all required fields and options.');
      this.builderForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    
    // Map the FormArray into the exact array of objects your backend expects
    const payload = {
      fields: this.questions.value.map((q: any, index: number) => ({
        ...q,
        order_index: index // Auto-assign the order based on array position
      }))
    };

    console.log('Sending to backend:', payload);
    // TODO: Call your bulk sync API here
    // this.appService.syncTemplateFields(this.templateId, payload).subscribe(...)
    
    setTimeout(() => { // Mocking the save
      this.isLoading = false;
      this.msg.success('Assessment Questions saved successfully!');
      this.router.navigate(['/admin/assessment-templates']);
    }, 1000);
  }

  goBack(): void {
    // this.router.navigate(['/admin/assessment-templates/edit', this.templateId]);
    this.location.back();
  }
}